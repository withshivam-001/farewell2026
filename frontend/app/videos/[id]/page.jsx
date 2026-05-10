'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Eye, Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '../../../components/layout/Navbar'
import ProfileSidebar from '../../../components/layout/ProfileSidebar'
import api from '../../../lib/api'
import useAuthStore from '../../../store/authStore'

export default function VideoDetailPage() {
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const { id } = useParams()
  const { user } = useAuthStore()

  useEffect(() => {
    api.get(`/videos/${id}`)
      .then(({ data }) => {
        setVideo(data.video)
        setLikeCount(data.video.likes?.length || 0)
        setLiked(data.video.likes?.includes(user?._id))
      })
      .catch(() => toast.error('Video load nahi hua'))
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/videos/${id}/like`)
      setLikeCount(data.likes)
      setLiked(!liked)
    } catch {}
  }

  if (loading) return (
    <><Navbar />
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-white/40">Loading...</div>
      </div>
    </>
  )

  if (!video) return (
    <><Navbar />
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-center text-white/40"><p className="text-4xl mb-3">🎬</p><p>Video nahi mila</p><Link href="/videos" className="btn-primary mt-4 px-5 py-2 rounded-xl text-sm inline-block">Wapas Jao</Link></div>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <ProfileSidebar />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/videos" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-6">
            <ArrowLeft size={16} /> Wapas Videos Pe
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Video player */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-6">
              <video src={video.videoUrl} controls className="w-full h-full" poster={video.thumbnailUrl} autoPlay />
            </div>
            {/* Info */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-display font-bold text-white text-2xl">{video.title}</h1>
                  <div className="flex items-center gap-4 mt-2 text-white/40 text-sm">
                    <span className="flex items-center gap-1"><Eye size={14} />{video.views} views</span>
                    <span>By {video.uploadedBy?.name}</span>
                  </div>
                </div>
                <button onClick={handleLike} className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all"
                  style={liked ? { borderColor: 'rgba(236,72,153,0.5)', background: 'rgba(236,72,153,0.1)', color: '#ec4899' } : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  <Heart size={16} className={liked ? 'fill-pink-400' : ''} />
                  <span>{likeCount}</span>
                </button>
              </div>
              {video.description && <p className="text-white/50 mt-4 leading-relaxed">{video.description}</p>}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
}
