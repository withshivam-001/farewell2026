'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import useAuthStore from '../../store/authStore'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function HeroSection() {
  const { user } = useAuthStore()

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
          style={{ width: 600, height: 400, background: 'rgba(124,58,237,0.15)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 rounded-full blur-[100px]"
          style={{ width: 400, height: 300, background: 'rgba(219,39,119,0.1)' }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 mb-6">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase"
            style={{
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#a78bfa',
            }}
          >
            ✦ Class of 2026 ✦
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1)}
          className="font-display font-black leading-[0.95] tracking-tight mb-6"
          style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}
        >
          <span className="text-white">Not Goodbye.</span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg,#7c3aed 0%,#db2777 60%,#f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            See You Around.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'rgba(240,240,248,0.55)' }}
        >
          A cinematic tribute to two incredible years. Revisit the memories,
          watch the moments, and cherish the bonds of the 2024–26 batch.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/videos"
            className="btn-primary text-base px-8 py-3.5 rounded-xl"
          >
            Watch Farewell Videos
          </Link>
          <Link
            href={user ? '/wall' : '/auth/signup'}
            className="btn-ghost text-base px-8 py-3.5 rounded-xl"
          >
            {user ? 'Visit the Wall' : 'Join the Batch'}
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-white/20 text-xs font-mono tracking-widest uppercase">Scroll</span>
          <motion.div
            className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent"
            animate={{ scaleY: [1, 0.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </section>
  )
}
