import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('bl_profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .single()

  if (!profile?.stripe_customer_id) return NextResponse.json({ error: 'No subscription found' }, { status: 404 })

  // Find active subscription
  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: 'active',
    limit: 1,
  })

  if (subscriptions.data.length === 0) return NextResponse.json({ error: 'No active subscription' }, { status: 404 })

  // Cancel at period end (not immediately)
  await stripe.subscriptions.update(subscriptions.data[0].id, {
    cancel_at_period_end: true,
  })

  // Mark cancel_scheduled on payer + partner
  const { data: fullProfile } = await supabase
    .from('bl_profiles')
    .select('id, partner_parent_id')
    .eq('user_id', user.id)
    .eq('role', 'parent')
    .single()

  if (fullProfile) {
    await supabase.from('bl_profiles').update({ cancel_scheduled: true }).eq('id', fullProfile.id)
    if (fullProfile.partner_parent_id) {
      await supabase.from('bl_profiles').update({ cancel_scheduled: true }).eq('id', fullProfile.partner_parent_id)
    }
  }

  return NextResponse.json({ ok: true })
}
