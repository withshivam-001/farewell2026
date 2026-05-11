'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VideoIntro({ onSkip, onEnded }) {
  const videoRef = useRef(null)
  const [showSkip, setShowSkip] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 1500)
    return () => clearTimeout(t)
  }, [])

  const handleSkip = () => {
    setVisible(false)
    setTimeout(onSkip, 500)
  }

  const handleEnded = () => {
    setVisible(false)
    setTimeout(onEnded, 400)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[90] overflow-hidden bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Video — replace src with your actual video URL */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src="/intro-video.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleEnded}
          />

          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.7) 100%)',
            }}
          />

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-mono text-xs tracking-[0.5em] text-white/50 uppercase mb-4">
                Class of 2026
              </p>
              <h1
                className="font-display font-black text-white leading-none"
                style={{
                  fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                  textShadow: '0 0 60px rgba(124,58,237,0.6)',
                }}
              >
                Our Story.
                <br />
                <span style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Our Farewell.
                </span>
              </h1>
              <p className="mt-6 text-white/60 text-lg font-light max-w-md mx-auto">
                Two years. A thousand memories. One goodbye.
              </p>
            </motion.div>
          </div>

          {/* Skip button */}
          <AnimatePresence>
            {showSkip && (
              <motion.button
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2
                  text-white/60 hover:text-white text-sm font-mono tracking-widest uppercase
                  px-6 py-3 border border-white/20 hover:border-white/50 rounded-full
                  backdrop-blur-sm transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={handleSkip}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Skip Intro</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 3l8 5-8 5V3zm9 0h1.5v10H12V3z"/>
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
