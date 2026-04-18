import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API = "https://golf-heroes-server.vercel.app"
export default function Signup() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(`${API}/api/auth/signup`, form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-black text-green-400">⛳ GolfHeroes</span>
          <p className="text-white/40 mt-2">Create your account</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {error && <div className="bg-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="space-y-4">
            {[
              { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'John Smith' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' }
            ].map(field => (
              <div key={field.key}>
                <label className="text-white/60 text-sm mb-1 block">{field.label}</label>
                <input type={field.type} value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  placeholder={field.placeholder} />
              </div>
            ))}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account? <Link to="/login" className="text-green-400 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}