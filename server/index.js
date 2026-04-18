const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Stripe webhook needs raw body — must be BEFORE express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())

app.get('/', (req, res) => res.json({ status: 'Golf Heroes API running' }))

try {
  app.use('/api/auth',   require('./routes/auth'))
  app.use('/api/scores', require('./routes/scores'))
  app.use('/api/charity',require('./routes/charity'))
  app.use('/api/draw',   require('./routes/draw'))
  app.use('/api/admin',  require('./routes/admin'))
  app.use('/api/stripe', require('./routes/stripe'))
  console.log('✅ All routes loaded')
} catch (err) {
  console.error('❌ Route error:', err.message)
}

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))

process.on('uncaughtException',  err => console.error('❌ Uncaught:', err.message))
process.on('unhandledRejection', err => console.error('❌ Unhandled:', err.message))
module.exports = app;