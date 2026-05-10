'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  dur: Math.random() * 3 + 2,
  delay: Math.random() * 2,
}))

export default function GlitchIntro({ onDone }) {
  const [visible, setVisible] = useState(true)
  const [glitchActive, setGlitchActive] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    // Random glitch bursts
    const glitchInterval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 200)
    }, 800)

    // Auto-advance after 4.5s
    timeoutRef.current = setTimeout(() => {
      clearInterval(glitchInterval)
      setVisible(false)
      setTimeout(onDone, 600)
    }, 4500)

    return () => {
      clearInterval(glitchInterval)
      clearTimeout(timeoutRef.current)
    }
  }, [onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: '#000' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Noise scanlines */}
          <div className="scanlines absolute inset-0 pointer-events-none" />

          {/* Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  background: p.id % 3 === 0 ? '#7c3aed' : p.id % 3 === 1 ? '#db2777' : '#fff',
                  opacity: 0,
                }}
                animate={{
                  opacity: [0, 0.8, 0],
                  y: [0, -30, -60],
                  scale: [1, 1.5, 0],
                }}
                transition={{
                  duration: p.dur,
                  delay: p.delay,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* RGB horizontal glitch lines */}
          {glitchActive && (
            <>
              <motion.div
                className="absolute left-0 right-0 h-px"
                style={{
                  top: `${30 + Math.random() * 40}%`,
                  background: 'rgba(0,255,255,0.6)',
                  boxShadow: '0 0 8px rgba(0,255,255,0.8)',
                }}
                initial={{ scaleX: 0, x: '-50%' }}
                animate={{ scaleX: 1, x: '0%' }}
                transition={{ duration: 0.15 }}
              />
              <motion.div
                className="absolute left-0 right-0 h-px"
                style={{
                  top: `${40 + Math.random() * 20}%`,
                  background: 'rgba(255,0,255,0.6)',
                  boxShadow: '0 0 8px rgba(255,0,255,0.8)',
                }}
                initial={{ scaleX: 0, x: '50%' }}
                animate={{ scaleX: 1, x: '0%' }}
                transition={{ duration: 0.12 }}
              />
            </>
          )}

          {/* Main year text */}
          <div className="relative text-center select-none">
            {/* Year */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h1
                data-text="2024–26"
                className={`glitch font-display font-black text-white select-none
                  text-[clamp(4rem,16vw,10rem)] leading-none tracking-tighter
                  ${glitchActive ? 'animate-glitch' : ''}`}
                style={{
                  textShadow: glitchActive
                    ? '2px 0 #ff00ff, -2px 0 #00ffff, 0 0 40px rgba(124,58,237,0.8)'
                    : '0 0 40px rgba(124,58,237,0.5)',
                }}
              >
                2024–26
              </h1>

              {/* Glitch clone layers */}
              {glitchActive && (
                <>
                  <span
                    className="absolute inset-0 font-display font-black text-[clamp(4rem,16vw,10rem)] leading-none tracking-tighter"
                    style={{
                      color: '#ff00ff',
                      opacity: 0.6,
                      transform: `translate(${Math.random() * 6 - 3}px, ${Math.random() * 4 - 2}px)`,
                      clipPath: 'polygon(0 20%, 100% 20%, 100% 50%, 0 50%)',
                      mixBlendMode: 'screen',
                    }}
                  >
                    2024–26
                  </span>
                  <span
                    className="absolute inset-0 font-display font-black text-[clamp(4rem,16vw,10rem)] leading-none tracking-tighter"
                    style={{
                      color: '#00ffff',
                      opacity: 0.5,
                      transform: `translate(${Math.random() * 6 - 3}px, ${Math.random() * 4 - 2}px)`,
                      clipPath: 'polygon(0 55%, 100% 55%, 100% 80%, 0 80%)',
                      mixBlendMode: 'screen',
                    }}
                  >
                    2024–26
                  </span>
                </>
              )}
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="mt-4 text-white/40 font-mono text-sm tracking-[0.4em] uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              The Final Chapter
            </motion.p>

            {/* Loading bar */}
            <motion.div
              className="mt-8 mx-auto h-[2px] rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.1)', width: 200 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #db2777)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.2, delay: 1, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
