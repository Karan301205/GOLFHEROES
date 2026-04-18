const express = require('express')
const router = express.Router()
const supabase = require('../supabase/client')
const auth = require('../middleware/auth')

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  next()
}

// GET all users
router.get('/users', auth, adminOnly, async (req, res) => {
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// UPDATE user subscription
router.put('/users/:id/subscription', auth, adminOnly, async (req, res) => {
  const { subscription_status, subscription_plan, subscription_end } = req.body
  const { data, error } = await supabase
    .from('profiles')
    .update({ subscription_status, subscription_plan, subscription_end })
    .eq('id', req.params.id).select()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data[0])
})

// GET all winners (for verification)
router.get('/winners', auth, adminOnly, async (req, res) => {
  const { data, error } = await supabase
    .from('winners').select('*, profiles(full_name), draws(draw_date)')
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// VERIFY winner
router.put('/winners/:id/verify', auth, adminOnly, async (req, res) => {
  const { verification_status, payment_status } = req.body
  const { data, error } = await supabase
    .from('winners')
    .update({ verification_status, payment_status })
    .eq('id', req.params.id).select()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data[0])
})

// ADD charity
router.post('/charities', auth, adminOnly, async (req, res) => {
  const { name, description, image_url, featured } = req.body
  const { data, error } = await supabase
    .from('charities').insert({ name, description, image_url, featured }).select()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data[0])
})

// DELETE charity
router.delete('/charities/:id', auth, adminOnly, async (req, res) => {
  const { error } = await supabase.from('charities').delete().eq('id', req.params.id)
  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Charity deleted' })
})

// GET analytics
router.get('/analytics', auth, adminOnly, async (req, res) => {
  const { count: totalUsers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true })
  const { count: activeUsers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active')
  const { data: winners } = await supabase.from('winners').select('prize_amount')
  const totalPrizes = winners?.reduce((sum, w) => sum + (w.prize_amount || 0), 0)

  res.json({ totalUsers, activeUsers, totalPrizes })
})

module.exports = router