const express = require('express')
const router = express.Router()
const Stripe = require('stripe')
const supabase = require('../supabase/client')
const auth = require('../middleware/auth')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create checkout session
router.post('/create-checkout', auth, async (req, res) => {
  const { plan } = req.body // 'monthly' or 'yearly'

  const prices = {
    monthly: { amount: 1000, interval: 'month', label: 'Monthly Plan' },
    yearly:  { amount: 9600, interval: 'year',  label: 'Yearly Plan'  }
  }

  const selected = prices[plan] || prices.monthly

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: selected.label },
          unit_amount: selected.amount,
          recurring: { interval: selected.interval }
        },
        quantity: 1
      }],
      success_url: `${process.env.CLIENT_URL}/dashboard?subscribed=true`,
      cancel_url:  `${process.env.CLIENT_URL}/dashboard?cancelled=true`,
      metadata: {
        user_id: req.user.id,
        plan
      }
    })

    res.json({ url: session.url })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Webhook - Stripe calls this when payment succeeds
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { user_id, plan } = session.metadata

    const end = new Date()
    if (plan === 'yearly') end.setFullYear(end.getFullYear() + 1)
    else end.setMonth(end.getMonth() + 1)

    await supabase.from('profiles').update({
      subscription_status: 'active',
      subscription_plan: plan,
      subscription_end: end.toISOString().split('T')[0]
    }).eq('id', user_id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    // Mark as inactive when subscription cancelled
    await supabase.from('profiles')
      .update({ subscription_status: 'inactive' })
      .eq('id', subscription.metadata?.user_id)
  }

  res.json({ received: true })
})

// Get subscription status
router.get('/status', auth, async (req, res) => {
  const { data } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_plan, subscription_end')
    .eq('id', req.user.id)
    .single()
  res.json(data)
})

module.exports = router