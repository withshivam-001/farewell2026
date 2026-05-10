'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import useAuthStore from '../../store/authStore'

export default function PendingApprovalGate() {
  const { user } = useAuthStore()
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16" style={{ background: '#0a0a0f' }}>
      <motion.div className="text-center max-w-md" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <Clock size={28} style={{ color: '#f59e0b' }} />
        </div>
        <h2 className="font-display font-bold text-white text-2xl mb-3">Profile Under Review</h2>
        <p className="text-white/50 text-sm leading-relaxed">
          Hey <span className="text-white font-medium">{user?.name}</span>! Your account is currently being reviewed by an admin.
          You'll get full access once approved. This usually takes a short while.
        </p>
        <div className="mt-8 glass rounded-2xl p-4 text-left">
          <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-3">What you can do now</p>
          <ul className="space-y-2 text-sm text-white/50">
            <li className="flex items-center gap-2">✓ <span>Browse the homepage</span></li>
            <li className="flex items-center gap-2">✓ <span>View batch info</span></li>
            <li className="flex items-center gap-2 text-white/25 line-through decoration-white/20">✗ <span>Access videos, wall, memories</span></li>
          </ul>
        </div>
        <Link href="/" className="btn-ghost inline-block mt-6 px-6 py-2.5 rounded-xl text-sm">← Go Home</Link>
      </motion.div>
    </div>
  )
}
