import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-black text-green-400">⛳ GolfHeroes</span>
          <p className="text-white/40 mt-2">Welcome back</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-1 block">Email</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1 block">Password</label>
              <input type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
                placeholder="••••••••" />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition mt-2">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          <p className="text-center text-white/40 text-sm mt-6">
            No account? <Link to="/signup" className="text-green-400 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}