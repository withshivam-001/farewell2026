'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Heart, Pin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import Navbar from '../../components/layout/Navbar'
import ProfileSidebar from '../../components/layout/ProfileSidebar'
import PendingApprovalGate from '../../components/ui/PendingApprovalGate'
import api from '../../lib/api'
import useAuthStore from '../../store/authStore'

export default function WallPage() {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { user, isApproved, isAdmin } = useAuthStore()

  const fetchComments = async (pg = 1) => {
    try {
      const { data } = await api.get(`/wall?page=${pg}&limit=30`)
      if (pg === 1) setComments(data.comments)
      else setComments((prev) => [...prev, ...data.comments])
      setHasMore(data.comments.length === 30)
    } catch (err) {
      if (err.response?.data?.code === 'PENDING_APPROVAL') return
      toast.error('Failed to load wall')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchComments() }, [])

  if (!isApproved?.()) {
    return (
      <>
        <Navbar />
        <PendingApprovalGate />
        <ProfileSidebar />
      </>
    )
  }

  const handlePost = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)
    try {
      const { data } = await api.post('/wall', { text: text.trim() })
      setComments((prev) => [data.comment, ...prev])
      setText('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/wall/${id}`)
      setComments((prev) => prev.filter((c) => c._id !== id))
      toast.success('Comment removed')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleLike = async (id) => {
    try {
      const { data } = await api.post(`/wall/${id}/like`)
      setComments((prev) =>
        prev.map((c) => c._id === id ? { ...c, likes: Array(data.likes).fill(null), liked: !c.liked } : c)
      )
    } catch {}
  }

  return (
    <>
      <Navbar />
      <ProfileSidebar />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2">Speak Your Heart</p>
            <h1 className="font-display font-black text-white text-4xl md:text-5xl">The Wall</h1>
            <p className="text-white/40 mt-2 text-sm">Leave a message for the 2024-26 batch</p>
          </motion.div>

          <motion.div className="glass rounded-2xl p-5 mb-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <form onSubmit={handlePost} className="flex-1 flex gap-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write something for the batch..."
                  maxLength={500}
                  rows={2}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/50 transition-colors text-sm resize-none"
                />
                <button type="submit" disabled={posting || !text.trim()} className="self-end w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                  <Send size={15} className="text-white" />
                </button>
              </form>
            </div>
            <p className="text-white/20 text-xs mt-2 text-right">{text.length}/500</p>
          </motion.div>

          {loading ? (
            <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass rounded-2xl p-5 animate-pulse h-20" />)}</div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {comments.map((c, i) => (
                  <motion.div key={c._id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="glass rounded-2xl p-5 group" style={c.isPinned ? { borderColor: 'rgba(124,58,237,0.35)' } : {}}>
                    {c.isPinned && <div className="flex items-center gap-1 text-purple-400 text-xs font-mono mb-3"><Pin size={11} /> Pinned</div>}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                        {c.author?.avatar ? <img src={c.author.avatar} alt="" className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>{c.author?.name?.[0]?.toUpperCase()}</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold text-sm">{c.author?.name || 'Unknown'}</span>
                          <span className="text-white/25 text-xs ml-auto">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                        </div>
                        <p className="text-white/75 text-sm mt-1.5 leading-relaxed break-words">{c.text}</p>
                        <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleLike(c._id)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-pink-400 transition-colors">
                            <Heart size={13} className={c.liked ? 'fill-pink-400 text-pink-400' : ''} />
                            <span>{c.likes?.length || 0}</span>
                          </button>
                          {(c.author?._id === user?._id || isAdmin?.()) && (
                            <button onClick={() => handleDelete(c._id)} className="flex items-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors">
                              <Trash2 size={12} /><span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {comments.length === 0 && <div className="text-center py-16 text-white/30"><p className="text-4xl mb-3">💬</p><p>Be the first to leave a message!</p></div>}
              {hasMore && <button onClick={() => { const next = page + 1; setPage(next); fetchComments(next) }} className="w-full py-3 text-white/40 hover:text-white/70 text-sm transition-colors glass rounded-xl mt-2">Load more</button>}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
