import { NextRequest, NextResponse } from 'next/server'
import { luluFetch, BOOK_SPEC } from '@/lib/lulu'

export async function POST(req: NextRequest) {
  const { pageCount, shippingAddress, phoneNumber } = await req.json()

  if (!pageCount || pageCount < 24) {
    return NextResponse.json({ error: 'Minimum 24 pages required' }, { status: 400 })
  }

  try {
    const res = await luluFetch('/print-job-cost-calculations/', {
      method: 'POST',
      body: JSON.stringify({
        line_items: [
          {
            page_count: pageCount,
            pod_package_id: BOOK_SPEC.pod_package_id,
            quantity: 1,
          },
        ],
        shipping_address: { ...shippingAddress, phone_number: phoneNumber },
        shipping_option: 'MAIL',
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status })

    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
