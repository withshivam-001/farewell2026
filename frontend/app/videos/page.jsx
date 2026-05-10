'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Eye, Heart } from 'lucide-react'
import Link from 'next/link'
import Navbar from '../../components/layout/Navbar'
import ProfileSidebar from '../../components/layout/ProfileSidebar'
import PendingApprovalGate from '../../components/ui/PendingApprovalGate'
import api from '../../lib/api'
import useAuthStore from '../../store/authStore'

const CATEGORIES = ['all', 'farewell', 'memories', 'highlights', 'other']

export default function VideosPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { isApproved } = useAuthStore()

  const fetchVideos = async (cat = category, pg = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 12, page: pg })
      if (cat !== 'all') params.append('category', cat)
      const { data } = await api.get(`/videos?${params}`)
      if (pg === 1) setVideos(data.videos)
      else setVideos((prev) => [...prev, ...data.videos])
      setHasMore(data.videos.length === 12)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchVideos(category, 1); setPage(1) }, [category])

  if (!isApproved?.()) return (<><Navbar /><PendingApprovalGate /><ProfileSidebar /></>)

  return (
    <>
      <Navbar />
      <ProfileSidebar />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2">Relive the Moments</p>
            <h1 className="font-display font-black text-white text-4xl md:text-5xl">Farewell Videos</h1>
          </motion.div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium capitalize transition-all"
                style={category === cat ? { background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: 'white' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {cat}
              </button>
            ))}
          </div>

          {loading && page === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="glass rounded-2xl aspect-video animate-pulse" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {videos.map((v, i) => (
                  <motion.div key={v._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-2xl overflow-hidden group">
                    <Link href={`/videos/${v._id}`}>
                      <div className="relative aspect-video bg-white/5">
                        {v.thumbnailUrl ? (
                          <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1a0a2e,#0d0d1a)' }}>
                            <Play size={32} className="text-white/20" />
                          </div>
                        )}
                        {v.isFeatured && (
                          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(124,58,237,0.85)', color: 'white' }}>Featured</span>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play size={20} className="text-white ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-white font-semibold text-sm truncate">{v.title}</p>
                        <div className="flex items-center gap-3 mt-2 text-white/35 text-xs">
                          <span>{v.uploadedBy?.name}</span>
                          <span className="flex items-center gap-1 ml-auto"><Eye size={11} />{v.views}</span>
                          <span className="flex items-center gap-1"><Heart size={11} />{v.likes?.length || 0}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              {videos.length === 0 && <div className="text-center py-20 text-white/30"><p className="text-4xl mb-3">🎬</p><p>No videos yet in this category</p></div>}
              {hasMore && (
                <div className="text-center mt-8">
                  <button onClick={() => { const next = page + 1; setPage(next); fetchVideos(category, next) }} className="btn-ghost px-8 py-3 rounded-xl">Load more</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
