const express = require('express')
const router = express.Router()
const supabase = require('../supabase/client')
const auth = require('../middleware/auth')

// GET all charities
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('charities').select('*').order('featured', { ascending: false })
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// SELECT charity (user picks one)
router.post('/select', auth, async (req, res) => {
  const { charity_id, charity_percentage } = req.body
  const pct = charity_percentage || 10
  if (pct < 10) return res.status(400).json({ error: 'Minimum 10% required' })

  const { data, error } = await supabase
    .from('profiles')
    .update({ charity_id, charity_percentage: pct })
    .eq('id', req.user.id).select()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data[0])
})

module.exports = router