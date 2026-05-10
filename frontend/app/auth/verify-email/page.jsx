'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import api from '../../../lib/api'

function VerifyContent() {
  const [status, setStatus] = useState('loading')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="text-center">
      {status === 'loading' && <><div className="text-4xl mb-4 animate-pulse">⏳</div><p className="text-white/60">Verify ho raha hai...</p></>}
      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-display font-bold text-white text-2xl mb-3">Email Verified!</h2>
          <p className="text-white/50 text-sm mb-6">Ab admin approval ka wait karo. Approve hone ke baad full access milega.</p>
          <Link href="/auth/login" className="btn-primary px-6 py-2.5 rounded-xl text-sm">Login Karo</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="font-display font-bold text-white text-2xl mb-3">Link Invalid Hai</h2>
          <p className="text-white/50 text-sm mb-6">Token expire ho gaya ya invalid hai. Dobara signup karo.</p>
          <Link href="/auth/signup" className="btn-primary px-6 py-2.5 rounded-xl text-sm">Dobara Signup Karo</Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0f' }}>
      <motion.div className="glass rounded-2xl p-10 max-w-md w-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Suspense fallback={<div className="text-white/40 text-center">Loading…</div>}>
          <VerifyContent />
        </Suspense>
      </motion.div>
    </div>
  )
}
