import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = "https://golf-heroes-server.vercel.app"
export default function Admin() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [tab, setTab] = useState('analytics')
  const [analytics, setAnalytics] = useState({})
  const [users, setUsers] = useState([])
  const [winners, setWinners] = useState([])
  const [charities, setCharities] = useState([])
  const [simulation, setSimulation] = useState(null)
  const [drawMode, setDrawMode] = useState('random')
  const [newCharity, setNewCharity] = useState({ name: '', description: '', featured: false })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [a, u, w, c] = await Promise.all([
        axios.get(`${API}/api/admin/analytics`, { headers }),
        axios.get(`${API}/api/admin/users`, { headers }),
        axios.get(`${API}/api/admin/winners`, { headers }),
        axios.get(`${API}/api/charity`)
      ])
      setAnalytics(a.data)
      setUsers(u.data)
      setWinners(w.data)
      setCharities(c.data)
    } catch { navigate('/login') }
  }

  const simulateDraw = async () => {
    const { data } = await axios.post(`${API}/api/draw/simulate`, { mode: drawMode }, { headers })
    setSimulation(data)
  }

  const publishDraw = async () => {
    if (!simulation) return alert('Simulate first')
    await axios.post(`${API}/api/draw/publish`, {
      winning_numbers: simulation.simulated_numbers,
      jackpot_amount: simulation.jackpot,
      pool_4match: simulation.pool_4match,
      pool_3match: simulation.pool_3match
    }, { headers })
    alert('Draw published and winners matched!')
    setSimulation(null)
  }

  const verifyWinner = async (id, status) => {
    await axios.put(`${API}/api/admin/winners/${id}/verify`,
      { verification_status: status, payment_status: status === 'approved' ? 'paid' : 'pending' },
      { headers })
    fetchAll()
  }

  const addCharity = async () => {
    await axios.post(`${API}/api/admin/charities`, newCharity, { headers })
    setNewCharity({ name: '', description: '', featured: false })
    fetchAll()
  }

  const deleteCharity = async (id) => {
    await axios.delete(`${API}/api/admin/charities/${id}`, { headers })
    fetchAll()
  }

  const tabs = ['analytics', 'users', 'draw', 'winners', 'charities']

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-white/10">
        <span className="text-xl font-bold text-green-400">⛳ GolfHeroes <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full ml-2">ADMIN</span></span>
        <button onClick={() => { localStorage.clear(); navigate('/') }}
          className="text-white/40 hover:text-white text-sm">Logout</button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black mb-8">Admin Panel</h1>

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                tab === t ? 'bg-green-500 text-black' : 'bg-white/10 text-white/60 hover:text-white'
              }`}>{t}</button>
          ))}
        </div>

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Total Users', value: analytics.totalUsers, color: 'text-blue-400' },
              { label: 'Active Subscribers', value: analytics.activeUsers, color: 'text-green-400' },
              { label: 'Total Prizes Paid', value: `£${analytics.totalPrizes || 0}`, color: 'text-yellow-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className={`text-4xl font-black mb-2 ${stat.color}`}>{stat.value ?? '—'}</div>
                <div className="text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <h2 className="text-xl font-bold mb-4">All Users ({users.length})</h2>
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{u.full_name}</p>
                    <p className="text-white/40 text-sm">{u.role} · charity {u.charity_percentage}%</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    u.subscription_status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>{u.subscription_status || 'inactive'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DRAW */}
        {tab === 'draw' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Draw Management</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex gap-4 mb-6">
                {['random', 'algorithm'].map(m => (
                  <button key={m} onClick={() => setDrawMode(m)}
                    className={`px-5 py-2 rounded-lg capitalize text-sm font-semibold transition ${
                      drawMode === m ? 'bg-green-500 text-black' : 'bg-white/10 text-white/60'
                    }`}>{m}</button>
                ))}
              </div>
              <button onClick={simulateDraw}
                className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-xl mr-4 transition">
                🎲 Simulate Draw
              </button>
              {simulation && (
                <div className="mt-6">
                  <p className="text-white/50 text-sm mb-3">Simulated Numbers:</p>
                  <div className="flex gap-3 mb-4">
                    {simulation.simulated_numbers.map((n, i) => (
                      <div key={i} className="w-12 h-12 rounded-full bg-green-500 text-black font-black text-lg flex items-center justify-center">
                        {n}
                      </div>
                    ))}
                  </div>
                  <p className="text-white/50 text-sm">Total Pool: £{simulation.total_pool} · Jackpot: £{simulation.jackpot} · 4-match: £{simulation.pool_4match} · 3-match: £{simulation.pool_3match}</p>
                  <button onClick={publishDraw}
                    className="mt-4 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-xl transition">
                    🚀 Publish Draw
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WINNERS */}
        {tab === 'winners' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Winners Verification</h2>
            {winners.length === 0
              ? <p className="text-white/30">No winners yet.</p>
              : <div className="space-y-3">
                  {winners.map(w => (
                    <div key={w.id} className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{w.profiles?.full_name}</p>
                        <p className="text-white/40 text-sm">{w.match_type} · £{w.prize_amount} · {w.draws?.draw_date}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          w.verification_status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          w.verification_status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>{w.verification_status}</span>
                        {w.verification_status === 'pending' && <>
                          <button onClick={() => verifyWinner(w.id, 'approved')}
                            className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-lg hover:bg-green-500/40">Approve</button>
                          <button onClick={() => verifyWinner(w.id, 'rejected')}
                            className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-lg hover:bg-red-500/40">Reject</button>
                        </>}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* CHARITIES */}
        {tab === 'charities' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Charity Management</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <p className="text-white/50 text-sm mb-4">Add new charity</p>
              <div className="flex gap-3 flex-wrap">
                <input placeholder="Charity name" value={newCharity.name}
                  onChange={e => setNewCharity({ ...newCharity, name: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500 flex-1" />
                <input placeholder="Description" value={newCharity.description}
                  onChange={e => setNewCharity({ ...newCharity, description: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500 flex-1" />
                <label className="flex items-center gap-2 text-white/60 text-sm">
                  <input type="checkbox" checked={newCharity.featured}
                    onChange={e => setNewCharity({ ...newCharity, featured: e.target.checked })} />
                  Featured
                </label>
                <button onClick={addCharity}
                  className="bg-green-500 hover:bg-green-400 text-black font-bold px-5 py-2 rounded-xl transition">
                  Add
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {charities.map(c => (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{c.name} {c.featured && '⭐'}</p>
                    <p className="text-white/40 text-sm">{c.description}</p>
                  </div>
                  <button onClick={() => deleteCharity(c.id)}
                    className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}