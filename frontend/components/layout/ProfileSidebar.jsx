'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit2, MessageSquare, Upload, LogOut, ExternalLink, Instagram, Shield } from 'lucide-react'
import Link from 'next/link'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function ProfileSidebar() {
  const [open, setOpen] = useState(false)
  const { user, logout, isAdmin } = useAuthStore()

  useEffect(() => {
    const handler = () => setOpen((v) => !v)
    window.addEventListener('toggle-profile-sidebar', handler)
    return () => window.removeEventListener('toggle-profile-sidebar', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    toast.success('Logged out successfully')
  }

  if (!user) return null

  const MENU_ITEMS = [
    { icon: Edit2, label: 'Edit Profile', href: '/profile/edit', color: '#7c3aed' },
    { icon: MessageSquare, label: 'Contact Admin', href: 'mailto:admin@farewell.com', color: '#0ea5e9' },
    { icon: Upload, label: 'Request Video Upload', href: '/profile/upload-request', color: '#f59e0b' },
    ...(isAdmin?.() ? [{ icon: Shield, label: 'Admin Dashboard', href: '/admin', color: '#10b981' }] : []),
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Sidebar */}
          <motion.aside
            className="fixed top-0 right-0 bottom-0 z-[70] w-80 flex flex-col overflow-hidden"
            style={{
              background: 'rgba(8,8,14,0.95)',
              backdropFilter: 'blur(40px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
            }}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <span className="font-display font-semibold text-white">Profile</span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile card */}
            <div className="px-6 py-6 border-b border-white/8">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}
                      >
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Online dot */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0f]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-white truncate">{user.name}</h3>
                  <p className="text-white/40 text-sm truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: user.isApproved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: user.isApproved ? '#10b981' : '#f59e0b',
                        border: `1px solid ${user.isApproved ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      }}
                    >
                      {user.isApproved ? 'Approved' : 'Under Review'}
                    </span>
                    {user.isPremium && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: 'rgba(124,58,237,0.15)',
                          color: '#a78bfa',
                          border: '1px solid rgba(124,58,237,0.3)',
                        }}
                      >
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {user.bio && (
                <p className="mt-4 text-white/50 text-sm leading-relaxed">{user.bio}</p>
              )}
            </div>

            {/* Menu items */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ background: `${item.color}20`, border: `1px solid ${item.color}30` }}
                  >
                    <item.icon size={15} style={{ color: item.color }} />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Admin socials */}
            <div className="px-6 py-4 border-t border-white/8">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Follow Admin</p>
              <a
                href="https://www.instagram.com/withshivam_._/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-white/8 hover:border-white/20 transition-all group"
              >
                <Instagram size={18} className="text-pink-400" />
                <span className="text-white/70 text-sm group-hover:text-white transition-colors">@adminhandle</span>
                <ExternalLink size={12} className="ml-auto text-white/30" />
              </a>
            </div>

            {/* Logout */}
            <div className="px-4 pb-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all text-sm font-medium"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
