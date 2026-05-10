'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const NAV_TABS = [
  { label: 'Farewell Videos', href: '/videos', protected: true },
  { label: 'Wall', href: '/wall', protected: true },
  { label: '2024–26', href: '/batch', protected: false },
  { label: 'Groups', href: '/groups', protected: true },
  { label: 'Memories', href: '/memories', protected: true },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, isApproved } = useAuthStore()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleTabClick = (tab) => {
    if (tab.protected && !isApproved?.()) {
      // Show "under review" — handled by page guard
    }
    setMobileOpen(false)
  }

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(10,10,15,0.85)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black font-mono"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
            >
              26
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight hidden sm:block">
              Farewell
              <span className="text-white/30 ml-1 font-light">2024–26</span>
            </span>
          </Link>

          {/* Desktop tabs */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_TABS.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => handleTabClick(tab)}
                  className="relative px-4 py-2 text-sm font-medium transition-colors rounded-lg group"
                  style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.5)' }}
                >
                  <span className="relative z-10 group-hover:text-white transition-colors">
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => {
                  // Dispatch event to open profile sidebar
                  window.dispatchEvent(new CustomEvent('toggle-profile-sidebar'))
                }}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 hover:border-purple-500 transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium px-4 py-2 rounded-lg text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Hamburger */}
            <button
              className="md:hidden text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <motion.div
              className="absolute top-16 left-0 right-0 glass-strong border-b border-white/10 py-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              {NAV_TABS.map((tab, i) => (
                <motion.div
                  key={tab.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={tab.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-6 py-3 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {tab.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
