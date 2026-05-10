'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useAuthStore from '../../../store/authStore'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.success) {
      toast.success('Welcome back!')
      router.push('/')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] pointer-events-none"
        style={{ width: 500, height: 300, background: 'rgba(124,58,237,0.12)' }} />

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
            <span className="text-white font-black font-mono">26</span>
          </div>
          <h1 className="font-display font-black text-white text-3xl">Welcome Back</h1>
          <p className="text-white/40 mt-2 text-sm">Sign in to your Farewell account</p>
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/60 text-sm mb-2 block">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 transition-colors text-sm"
              />
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
