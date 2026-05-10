'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/layout/Navbar'
import ProfileSidebar from '../../components/layout/ProfileSidebar'
import PendingApprovalGate from '../../components/ui/PendingApprovalGate'
import api from '../../lib/api'
import useAuthStore from '../../store/authStore'
import { format } from 'date-fns'

export default function MemoriesPage() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const { isApproved } = useAuthStore()

  useEffect(() => {
    api.get('/memories').then(({ data }) => setMemories(data.memories || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (!isApproved?.()) return (<><Navbar /><PendingApprovalGate /><ProfileSidebar /></>)

  return (
    <>
      <Navbar />
      <ProfileSidebar />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2">Frozen in Time</p>
            <h1 className="font-display font-black text-white text-4xl md:text-5xl">Memories</h1>
          </motion.div>
          {loading ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="glass rounded-2xl animate-pulse break-inside-avoid mb-4" style={{ height: `${120 + (i % 3) * 60}px` }} />)}
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-20 text-white/30"><p className="text-4xl mb-3">📸</p><p>No memories uploaded yet</p></div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {memories.map((m, i) => (
                <motion.div key={m._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="break-inside-avoid mb-3 glass rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => setSelected(m)}>
                  {m.coverImage && <img src={m.coverImage} alt={m.title} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                  <div className="p-3">
                    <p className="text-white font-semibold text-sm truncate">{m.title}</p>
                    {m.date && <p className="text-white/35 text-xs mt-0.5">{format(new Date(m.date), 'MMM yyyy')}</p>}
                    {m.images?.length > 1 && <p className="text-white/25 text-xs">{m.images.length} photos</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="font-display font-bold text-white text-xl mb-1">{selected.title}</h2>
              {selected.description && <p className="text-white/50 text-sm mb-4">{selected.description}</p>}
              <div className="grid grid-cols-2 gap-2">
                {selected.images.map((img, i) => <img key={i} src={img.url} alt={img.caption || ''} className="w-full rounded-xl object-cover aspect-square" />)}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
