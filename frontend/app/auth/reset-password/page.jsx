'use client'
import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '../../../lib/api'

function ResetForm() {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return toast.error('Invalid reset link')
    if (form.password !== form.confirm) return toast.error('Passwords match nahi kar rahe')
    if (form.password.length < 8) return toast.error('Password kam se kam 8 characters ka hona chahiye')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password: form.password })
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 2500)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed. Link expire ho gaya hoga.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-white/70 text-sm">Password reset ho gaya! Login pe redirect ho rahe hain…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {[
        { key: 'password', label: 'Naya Password', placeholder: '8+ characters' },
        { key: 'confirm', label: 'Confirm Password', placeholder: 'Dobara likho' },
      ].map((f) => (
        <div key={f.key}>
          <label className="text-white/60 text-sm mb-2 block">{f.label}</label>
          <input type="password" required value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 transition-colors text-sm" />
        </div>
      ))}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl disabled:opacity-60">
        {loading ? 'Reset ho raha hai...' : 'Password Reset Karo'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0f' }}>
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="font-display font-black text-white text-3xl">Naya Password Set Karo</h1>
        </div>
        <div className="glass rounded-2xl p-8">
          <Suspense fallback={<div className="text-white/40 text-sm text-center">Loading…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  )
}
