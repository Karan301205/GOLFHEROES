const express = require('express')
const router = express.Router()
const supabase = require('../supabase/client')
const auth = require('../middleware/auth')

// GET my scores
router.get('/', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', req.user.id)
    .order('score_date', { ascending: false })
    .limit(5)
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// ADD score (rolling 5 logic)
router.post('/', auth, async (req, res) => {
  const { score, score_date } = req.body
  if (!score || !score_date)
    return res.status(400).json({ error: 'Score and date required' })
  if (score < 1 || score > 45)
    return res.status(400).json({ error: 'Score must be between 1 and 45' })

  // Check duplicate date
  const { data: existing } = await supabase
    .from('scores').select('id')
    .eq('user_id', req.user.id).eq('score_date', score_date)
  if (existing?.length > 0)
    return res.status(400).json({ error: 'Score for this date already exists' })

  // Count current scores
  const { data: current } = await supabase
    .from('scores').select('*')
    .eq('user_id', req.user.id)
    .order('score_date', { ascending: true })

  // If already 5, delete the oldest
  if (current?.length >= 5) {
    await supabase.from('scores').delete().eq('id', current[0].id)
  }

  const { data, error } = await supabase
    .from('scores').insert({ user_id: req.user.id, score, score_date }).select()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data[0])
})

// EDIT score
router.put('/:id', auth, async (req, res) => {
  const { score, score_date } = req.body
  const { data, error } = await supabase
    .from('scores')
    .update({ score, score_date })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data[0])
})

// DELETE score
router.delete('/:id', auth, async (req, res) => {
  const { error } = await supabase
    .from('scores').delete()
    .eq('id', req.params.id).eq('user_id', req.user.id)
  if (error) return res.status(400).json({ error: error.message })
  res.json({ message: 'Score deleted' })
})

module.exports = router