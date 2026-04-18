import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [scores, setScores] = useState([])
  const [charities, setCharities] = useState([])
  const [wins, setWins] = useState([])
  const [latestDraw, setLatestDraw] = useState(null)
  const [profile, setProfile] = useState({})
  const [tab, setTab] = useState('scores')

  const [newScore, setNewScore] = useState({ score: '', score_date: '' })
  const [editingScore, setEditingScore] = useState(null)
  const [scoreError, setScoreError] = useState('')
  const [scoreSuccess, setScoreSuccess] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [s, c, w, d] = await Promise.all([
        axios.get(`${API}/api/scores`, { headers }),
        axios.get(`${API}/api/charity`),
        axios.get(`${API}/api/draw/my-wins`, { headers }),
        axios.get(`${API}/api/draw/latest`)
      ])
      setScores(s.data)
      setCharities(c.data)
      setWins(w.data)
      setLatestDraw(d.data)
      setProfile(user)
    } catch (err) {
      if (err.response?.status === 401) navigate('/login')
    }
  }

  const addScore = async () => {
    setScoreError(''); setScoreSuccess('')
    try {
      await axios.post(`${API}/api/scores`, newScore, { headers })
      setNewScore({ score: '', score_date: '' })
      setScoreSuccess('Score added!')
      fetchAll()
    } catch (err) { setScoreError(err.response?.data?.error || 'Error adding score') }
  }

  const updateScore = async (id) => {
    try {
      await axios.put(`${API}/api/scores/${id}`, editingScore, { headers })
      setEditingScore(null)
      fetchAll()
    } catch (err) { setScoreError(err.response?.data?.error || 'Error updating') }
  }

  const deleteScore = async (id) => {
    await axios.delete(`${API}/api/scores/${id}`, { headers })
    fetchAll()
  }

  const selectCharity = async (charity_id) => {
    await axios.post(`${API}/api/charity/select`, { charity_id }, { headers })
    alert('Charity updated!')
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const tabs = ['scores', 'charity', 'draws', 'wins', 'subscription']

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-white/10">
        <span className="text-xl font-bold text-green-400">⛳ GolfHeroes</span>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm">👋 {user.full_name}</span>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
            user.subscription_status === 'active'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {user.subscription_status || 'inactive'}
          </span>
          <button onClick={logout} className="text-white/40 hover:text-white text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black mb-2">Your Dashboard</h1>
        <p className="text-white/40 mb-8">Track scores, support charities, win prizes</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-0">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-t-lg text-sm font-semibold capitalize transition ${
                tab === t ? 'bg-green-500 text-black' : 'text-white/40 hover:text-white'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* SCORES TAB */}
        {tab === 'scores' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Golf Scores</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <p className="text-white/50 text-sm mb-4">Add a new score (1–45 Stableford, max 5 stored)</p>
              {scoreError && <p className="text-red-400 text-sm mb-3">{scoreError}</p>}
              {scoreSuccess && <p className="text-green-400 text-sm mb-3">{scoreSuccess}</p>}
              <div className="flex gap-3 flex-wrap">
                <input type="number" min="1" max="45" placeholder="Score (1-45)"
                  value={newScore.score}
                  onChange={e => setNewScore({ ...newScore, score: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500 w-40" />
                <input type="date" value={newScore.score_date}
                  onChange={e => setNewScore({ ...newScore, score_date: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500" />
                <button onClick={addScore}
                  className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-2 rounded-xl transition">
                  Add Score
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {scores.length === 0 && <p className="text-white/30">No scores yet. Add your first score above.</p>}
              {scores.map(s => (
                <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex items-center justify-between">
                  {editingScore?.id === s.id ? (
                    <div className="flex gap-3 flex-wrap items-center">
                      <input type="number" min="1" max="45" value={editingScore.score}
                        onChange={e => setEditingScore({ ...editingScore, score: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white w-24 focus:outline-none" />
                      <input type="date" value={editingScore.score_date}
                        onChange={e => setEditingScore({ ...editingScore, score_date: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white focus:outline-none" />
                      <button onClick={() => updateScore(s.id)}
                        className="bg-green-500 text-black text-sm font-bold px-4 py-1 rounded-lg">Save</button>
                      <button onClick={() => setEditingScore(null)}
                        className="text-white/40 text-sm">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-black text-green-400">{s.score}</span>
                        <div>
                          <p className="text-white/80 font-semibold">Stableford Score</p>
                          <p className="text-white/40 text-sm">{new Date(s.score_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingScore(s)}
                          className="text-blue-400 hover:text-blue-300 text-sm">Edit</button>
                        <button onClick={() => deleteScore(s.id)}
                          className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHARITY TAB */}
        {tab === 'charity' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Choose Your Charity</h2>
            <p className="text-white/40 text-sm mb-6">10% of your subscription goes to your chosen charity</p>
            <div className="grid md:grid-cols-2 gap-4">
              {charities.map(c => (
                <div key={c.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-green-500/50 transition cursor-pointer"
                  onClick={() => selectCharity(c.id)}>
                  {c.featured && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full mb-3 inline-block">⭐ Featured</span>}
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <p className="text-white/40 text-sm mt-1">{c.description}</p>
                  <button className="mt-4 text-green-400 text-sm font-semibold hover:underline">Select →</button>
                </div>
              ))}
              {charities.length === 0 && <p className="text-white/30">No charities listed yet.</p>}
            </div>
          </div>
        )}

        {/* DRAWS TAB */}
        {tab === 'draws' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Latest Draw</h2>
            {latestDraw ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-white/40 text-sm mb-4">Draw Date: {new Date(latestDraw.draw_date).toLocaleDateString()}</p>
                <div className="flex justify-center gap-4 mb-6">
                  {latestDraw.winning_numbers?.map((n, i) => (
                    <div key={i} className="w-14 h-14 rounded-full bg-green-500 text-black font-black text-xl flex items-center justify-center">
                      {n}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-black/40 rounded-xl p-4">
                    <div className="text-yellow-400 font-black text-xl">£{latestDraw.jackpot_amount}</div>
                    <div className="text-white/40 text-sm">Jackpot (5 match)</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4">
                    <div className="text-green-400 font-black text-xl">£{latestDraw.pool_4match}</div>
                    <div className="text-white/40 text-sm">4 Match</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4">
                    <div className="text-blue-400 font-black text-xl">£{latestDraw.pool_3match}</div>
                    <div className="text-white/40 text-sm">3 Match</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-4">🎯</p>
                <p className="text-white/50">No draw published yet. Check back soon!</p>
              </div>
            )}
          </div>
        )}

        {/* WINS TAB */}
        {tab === 'wins' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Winnings</h2>
            {wins.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-4xl mb-4">🏆</p>
                <p className="text-white/50">No wins yet — keep playing!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wins.map(w => (
                  <div key={w.id} className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-green-400">{w.match_type}</p>
                      <p className="text-white/40 text-sm">{w.draws?.draw_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl">£{w.prize_amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        w.payment_status === 'paid'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>{w.payment_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* SUBSCRIPTION TAB */}
{tab === 'subscription' && (
  <div>
    <h2 className="text-xl font-bold mb-4">Subscription</h2>
    <div className="grid md:grid-cols-2 gap-6">
      {[
        {
          plan: 'monthly',
          price: '£10',
          period: 'per month',
          perks: ['Monthly draw entry', 'Score tracking', 'Charity contribution']
        },
        {
          plan: 'yearly',
          price: '£96',
          period: 'per year',
          perks: ['Everything in monthly', '2 months free', 'Priority support']
        }
      ].map((p) => (
        <div key={p.plan}
          className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-green-500/50 transition">
          <div className="capitalize font-bold text-lg mb-1">{p.plan} Plan</div>
          <div className="text-4xl font-black text-green-400 mb-1">{p.price}</div>
          <div className="text-white/40 text-sm mb-6">{p.period}</div>
          <ul className="space-y-2 mb-8">
            {p.perks.map((perk, i) => (
              <li key={i} className="text-white/60 text-sm flex items-center gap-2">
                <span className="text-green-400">✓</span> {perk}
              </li>
            ))}
          </ul>
          <button
            onClick={async () => {
              const token = localStorage.getItem('token')
              const res = await fetch('http://localhost:5001/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ plan: p.plan })
              })
              const data = await res.json()
              if (data.url) window.location.href = data.url
              else alert(data.error)
            }}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition">
            Subscribe {p.plan === 'yearly' ? '🏆' : ''}
          </button>
        </div>
      ))}
    </div>
  </div>
)}
    </div>
  )
}