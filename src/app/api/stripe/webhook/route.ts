import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Use service role to bypass RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const profileId = session.metadata?.profile_id
    if (profileId) {
      // Update the paying user's plan
      await supabaseAdmin.from('bl_profiles').update({ plan: 'family' }).eq('id', profileId)
      // Also update partner's plan if connected
      const { data: profile } = await supabaseAdmin
        .from('bl_profiles')
        .select('partner_parent_id')
        .eq('id', profileId)
        .single()
      if (profile?.partner_parent_id) {
        await supabaseAdmin.from('bl_profiles').update({ plan: 'family' }).eq('id', profile.partner_parent_id)
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    // Update the payer's plan
    const { data: profile } = await supabaseAdmin
      .from('bl_profiles')
      .select('id, partner_parent_id')
      .eq('stripe_customer_id', customerId)
      .single()
    if (profile) {
      await supabaseAdmin.from('bl_profiles').update({ plan: 'free' }).eq('id', profile.id)
      if (profile.partner_parent_id) {
        await supabaseAdmin.from('bl_profiles').update({ plan: 'free' }).eq('id', profile.partner_parent_id)
      }
    }
  }

  return NextResponse.json({ received: true })
}
