const express = require('express')
const router = express.Router()
const supabase = require('../supabase/client')
const auth = require('../middleware/auth')

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
  next()
}

// GET latest published draw
router.get('/latest', async (req, res) => {
  const { data, error } = await supabase
    .from('draws').select('*')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(1)
  if (error) return res.status(400).json({ error: error.message })
  res.json(data[0] || null)
})

// SIMULATE draw (admin)
router.post('/simulate', auth, adminOnly, async (req, res) => {
  const { mode } = req.body // 'random' or 'algorithm'
  let numbers = []

  if (mode === 'algorithm') {
    // Weighted by most frequent scores across all users
    const { data: scores } = await supabase.from('scores').select('score')
    const freq = {}
    scores.forEach(s => { freq[s.score] = (freq[s.score] || 0) + 1 })
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
    numbers = sorted.slice(0, 5).map(e => parseInt(e[0]))
    while (numbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1
      if (!numbers.includes(n)) numbers.push(n)
    }
  } else {
    while (numbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1
      if (!numbers.includes(n)) numbers.push(n)
    }
  }

  // Calculate prize pools based on active subscribers
  const { count } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active')

  const poolPerUser = 10 // £10 per sub goes to prize pool
  const totalPool = (count || 0) * poolPerUser

  res.json({
    simulated_numbers: numbers,
    total_pool: totalPool,
    jackpot: totalPool * 0.4,
    pool_4match: totalPool * 0.35,
    pool_3match: totalPool * 0.25
  })
})

// PUBLISH draw (admin)
router.post('/publish', auth, adminOnly, async (req, res) => {
  const { winning_numbers, jackpot_amount, pool_4match, pool_3match } = req.body

  const { data: draw, error } = await supabase.from('draws').insert({
    draw_date: new Date().toISOString().split('T')[0],
    winning_numbers,
    status: 'published',
    jackpot_amount,
    pool_4match,
    pool_3match
  }).select()
  if (error) return res.status(400).json({ error: error.message })

  // Match users scores against winning numbers
  const { data: allScores } = await supabase
    .from('scores').select('user_id, score')

  const userScores = {}
  allScores.forEach(s => {
    if (!userScores[s.user_id]) userScores[s.user_id] = []
    userScores[s.user_id].push(s.score)
  })

  for (const [user_id, scores] of Object.entries(userScores)) {
    const matches = scores.filter(s => winning_numbers.includes(s)).length
    let match_type = null
    let prize_amount = 0

    if (matches >= 5) { match_type = '5-match'; prize_amount = jackpot_amount }
    else if (matches === 4) { match_type = '4-match'; prize_amount = pool_4match }
    else if (matches === 3) { match_type = '3-match'; prize_amount = pool_3match }

    if (match_type) {
      await supabase.from('winners').insert({
        draw_id: draw[0].id, user_id, match_type, prize_amount
      })
    }
  }

  res.json({ draw: draw[0], message: 'Draw published and winners matched' })
})

// GET my winnings
router.get('/my-wins', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('winners').select('*, draws(draw_date)')
    .eq('user_id', req.user.id)
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

module.exports = router