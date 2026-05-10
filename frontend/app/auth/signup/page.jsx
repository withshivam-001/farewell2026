'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '../../../lib/api'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await api.post('/auth/signup', { name: form.name, email: form.email, password: form.password })
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0f' }}>
        <motion.div className="text-center max-w-md" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-5xl mb-4">📬</div>
          <h2 className="font-display font-bold text-white text-2xl mb-3">Check your email</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            We sent a verification link to <span className="text-purple-400">{form.email}</span>.
            Click it to verify, then wait for admin approval before accessing the site.
          </p>
          <Link href="/auth/login" className="btn-primary inline-block mt-6 px-6 py-2.5 rounded-xl text-sm">
            Back to Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] pointer-events-none"
        style={{ width: 500, height: 300, background: 'rgba(219,39,119,0.1)' }} />

      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
            <span className="text-white font-black font-mono">26</span>
          </div>
          <h1 className="font-display font-black text-white text-3xl">Join the Batch</h1>
          <p className="text-white/40 mt-2 text-sm">Create your Farewell 2024–26 account</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '8+ characters' },
              { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-white/60 text-sm mb-2 block">{field.label}</label>
                <input
                  type={field.type}
                  required
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 transition-colors text-sm"
                />
              </div>
            ))}

            <div className="pt-1">
              <p className="text-white/25 text-xs mb-3">
                After signup, an admin will review and approve your account.
              </p>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl disabled:opacity-60">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
