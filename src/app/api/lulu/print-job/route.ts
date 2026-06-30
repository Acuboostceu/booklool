import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { luluFetch, BOOK_SPEC } from '@/lib/lulu'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { interiorUrl, coverUrl, pageCount, shippingAddress, phoneNumber, contactEmail, title } = await req.json()

  if (!interiorUrl || !coverUrl || !pageCount || !shippingAddress) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const res = await luluFetch('/print-jobs/', {
      method: 'POST',
      body: JSON.stringify({
        contact_email: contactEmail || user.email,
        line_items: [
          {
            title: title || 'My Book',
            cover: { source_url: coverUrl },
            interior: { source_url: interiorUrl },
            pod_package_id: BOOK_SPEC.pod_package_id,
            quantity: 1,
          },
        ],
        shipping_address: { ...shippingAddress, phone_number: phoneNumber },
        shipping_option: 'MAIL',
        production_delay: 60,
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status })

    // 주문 내역 저장
    await supabase.from('bl_print_orders').insert({
      user_id: user.id,
      lulu_job_id: data.id,
      status: data.status?.name ?? 'CREATED',
      title,
      shipping_address: shippingAddress,
    })

    return NextResponse.json({ jobId: data.id, status: data.status?.name })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
