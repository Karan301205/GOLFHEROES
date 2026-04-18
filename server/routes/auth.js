const express = require('express')
const router = express.Router()
const supabase = require('../supabase/client')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// SIGNUP
router.post('/signup', async (req, res) => {
  const { email, password, full_name } = req.body
  if (!email || !password || !full_name)
    return res.status(400).json({ error: 'All fields required' })

  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true
  })
  if (error) return res.status(400).json({ error: error.message })

  await supabase.from('profiles').insert({
    id: data.user.id,
    full_name,
    role: 'subscriber'
  })

  const token = jwt.sign(
    { id: data.user.id, email, role: 'subscriber' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.json({ token, user: { id: data.user.id, email, full_name, role: 'subscriber' } })
})

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return res.status(400).json({ error: error.message })

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', data.user.id).single()

  const token = jwt.sign(
    { id: data.user.id, email, role: profile.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.json({ token, user: { ...profile, email } })
})

module.exports = router