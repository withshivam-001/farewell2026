'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Image as ImageIcon, Users, MessageSquare, ArrowRight } from 'lucide-react'
import api from '../../lib/api'

// ─── Batch Stats ──────────────────────────────────────────────────
const STATS = [
  { label: 'Batch Members', value: '60+', icon: Users },
  { label: 'Memories Captured', value: '200+', icon: ImageIcon },
  { label: 'Farewell Videos', value: '12+', icon: Play },
  { label: 'Wall Messages', value: '150+', icon: MessageSquare },
]

export function BatchStats() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass rounded-2xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03, borderColor: 'rgba(124,58,237,0.4)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              <stat.icon size={18} style={{ color: '#a78bfa' }} />
            </div>
            <p
              className="font-display font-black text-3xl"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {stat.value}
            </p>
            <p className="text-white/40 text-sm mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── Featured Videos ──────────────────────────────────────────────
export function FeaturedVideos() {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    api.get('/videos?limit=4').then(({ data }) => setVideos(data.videos || [])).catch(() => {})
  }, [])

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Farewell Videos" subtitle="Watch the moments we made together" href="/videos" />
        {videos.length === 0 ? (
          <PlaceholderGrid count={4} aspect="aspect-video" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {videos.map((v, i) => (
              <VideoCard key={v._id} video={v} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function VideoCard({ video, index }) {
  return (
    <motion.div
      className="glass rounded-2xl overflow-hidden group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/videos/${video._id}`}>
        <div className="relative aspect-video bg-white/5 overflow-hidden">
          {video.thumbnailUrl ? (
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1a0a2e,#0a0a1a)' }}>
              <Play size={32} className="text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play size={20} className="text-white ml-1" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-white font-medium text-sm truncate">{video.title}</p>
          <p className="text-white/40 text-xs mt-1">{video.uploadedBy?.name}</p>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Memories Preview ─────────────────────────────────────────────
export function MemoriesPreview() {
  const [memories, setMemories] = useState([])

  useEffect(() => {
    api.get('/memories').then(({ data }) => setMemories((data.memories || []).slice(0, 6))).catch(() => {})
  }, [])

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Memories" subtitle="Moments frozen in time" href="/memories" />
        {memories.length === 0 ? (
          <PlaceholderGrid count={6} aspect="aspect-square" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
            {memories.map((m, i) => (
              <motion.div
                key={m._id}
                className={`rounded-2xl overflow-hidden glass group cursor-pointer ${i === 0 || i === 3 ? 'col-span-2 row-span-2' : ''}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link href={`/memories`}>
                  <div className="relative w-full h-full min-h-[120px] bg-white/5">
                    {m.coverImage && (
                      <img src={m.coverImage} alt={m.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="absolute bottom-2 left-3 right-3 text-white text-xs font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">{m.title}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Groups Preview ───────────────────────────────────────────────
export function GroupsPreview() {
  const [groups, setGroups] = useState([])

  useEffect(() => {
    api.get('/groups').then(({ data }) => setGroups((data.groups || []).slice(0, 4))).catch(() => {})
  }, [])

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Our Groups" subtitle="The squads that made it all happen" href="/groups" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {groups.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 h-32 animate-pulse" />
              ))
            : groups.map((g, i) => (
                <motion.div
                  key={g._id}
                  className="glass rounded-2xl p-6 group cursor-pointer hover:border-purple-500/30 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {g.avatar ? (
                      <img src={g.avatar} alt={g.name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}
                      >
                        {g.name?.[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm">{g.name}</p>
                      <p className="text-white/40 text-xs">{g.members?.length || 0} members</p>
                    </div>
                  </div>
                  {g.description && (
                    <p className="text-white/40 text-xs line-clamp-2">{g.description}</p>
                  )}
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────
export function FooterSection() {
  return (
    <footer className="border-t border-white/8 py-12 px-4 mt-8">
      <div className="max-w-5xl mx-auto text-center">
        <div
          className="font-display font-black text-4xl mb-3"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          2024–26
        </div>
        <p className="text-white/30 text-sm">
          Made with ❤️ for the most unforgettable batch. Until we meet again.
        </p>
        <p className="text-white/15 text-xs mt-4">© {new Date().getFullYear()} Farewell 2024–26</p>
      </div>
    </footer>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, href }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <motion.p
          className="text-xs font-mono uppercase tracking-wider mb-1"
          style={{ color: '#a78bfa' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ✦ Featured
        </motion.p>
        <motion.h2
          className="font-display font-bold text-white text-3xl md:text-4xl"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {title}
        </motion.h2>
        {subtitle && <p className="text-white/40 mt-1">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors group"
        >
          View all
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  )
}

function PlaceholderGrid({ count, aspect }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-8`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`glass rounded-2xl ${aspect} animate-pulse`} style={{ minHeight: 120 }} />
      ))}
    </div>
  )
}
