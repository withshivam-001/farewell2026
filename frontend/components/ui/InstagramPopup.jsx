'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Instagram } from 'lucide-react'
import useAuthStore from '../../store/authStore'

export default function InstagramPopup() {
  const [visible, setVisible] = useState(false)
  const { user } = useAuthStore()
  const ADMIN_IG = 'https://instagram.com/youradminhandle'
  const ADMIN_HANDLE = '@adminhandle'

  useEffect(() => {
    if (!user) return
    const shown = parseInt(sessionStorage.getItem('ig_popup_shown') || '0')
    if (shown >= 2) return
    const timer = setTimeout(() => {
      setVisible(true)
      sessionStorage.setItem('ig_popup_shown', String(shown + 1))
    }, 90000) // 1.5 min
    return () => clearTimeout(timer)
  }, [user])

  if (!user) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 right-6 z-[80] w-72"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="glass-strong rounded-2xl p-5 border border-white/10">
            <button onClick={() => setVisible(false)} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors">
              <X size={14} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                <Instagram size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Follow on Instagram</p>
                <p className="text-white/40 text-xs">{ADMIN_HANDLE}</p>
              </div>
            </div>
            <p className="text-white/50 text-xs mb-4 leading-relaxed">
              Stay updated with behind-the-scenes content and farewell updates!
            </p>
            <a
              href={ADMIN_IG}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full py-2.5 rounded-xl text-sm text-center block"
              onClick={() => setVisible(false)}
            >
              Follow Now
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
