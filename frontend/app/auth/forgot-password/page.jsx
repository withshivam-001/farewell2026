'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import toast from 'react-hot-toast'
import api from '../../../lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      toast.error('Kuch galat hua. Dobara try karo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0f' }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] pointer-events-none"
        style={{ width: 400, height: 250, background: 'rgba(124,58,237,0.12)' }} />
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔑</div>
          <h1 className="font-display font-black text-white text-3xl">Forgot Password</h1>
          <p className="text-white/40 mt-2 text-sm">Apna email daalo, reset link bhejenge</p>
        </div>
        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📬</div>
              <p className="text-white/70 text-sm">Agar email exist karta hai toh reset link bhej diya. Inbox check karo.</p>
              <Link href="/auth/login" className="btn-primary inline-block mt-6 px-6 py-2.5 rounded-xl text-sm">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 transition-colors text-sm" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl disabled:opacity-60">
                {loading ? 'Bhej rahe hain...' : 'Reset Link Bhejo'}
              </button>
              <p className="text-center">
                <Link href="/auth/login" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Wapas login pe</Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
