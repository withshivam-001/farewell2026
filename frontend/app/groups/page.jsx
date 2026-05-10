'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users2, Plus, X, ImageIcon, Upload, Clock, RefreshCw, ArrowLeft, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../../components/layout/Navbar'
import ProfileSidebar from '../../components/layout/ProfileSidebar'
import PendingApprovalGate from '../../components/ui/PendingApprovalGate'
import api from '../../lib/api'
import useAuthStore from '../../store/authStore'

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [myRequests, setMyRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [openGroup, setOpenGroup] = useState(null) // group detail view
  const [showImageUpload, setShowImageUpload] = useState(null)
  const [previewImg, setPreviewImg] = useState(null) // { images: [], index: 0 }
  const [form, setForm] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const { isApproved } = useAuthStore()

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    try {
      const [groupsRes, requestsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/users/my-group-requests'),
      ])
      setGroups(groupsRes.data.groups || [])
      setMyRequests(requestsRes.data.requests || [])
      // Refresh open group too
      if (openGroup) {
        const updated = (groupsRes.data.groups || []).find(g => g._id === openGroup._id)
        if (updated) setOpenGroup(updated)
      }
    } catch (err) {
      toast.error('Data load nahi hua')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [openGroup])

  useEffect(() => {
    if (!isApproved?.()) return
    fetchData()
  }, [isApproved])

  if (!isApproved?.()) return (<><Navbar /><PendingApprovalGate /><ProfileSidebar /></>)

  const hasPendingRequest = myRequests.some(r => r.status === 'pending')

  const handleGroupRequest = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Group ka naam daalo')
    setSubmitting(true)
    try {
      const { data } = await api.post('/users/group-request', {
        name: form.name.trim(),
        description: form.description.trim(),
      })
      setMyRequests(p => [data.request, ...p])
      setShowRequestForm(false)
      setForm({ name: '', description: '' })
      toast.success('✅ Group request bhej di!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request fail ho gaya')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Group Detail View (folder khula) ──────────────────────────────
  if (openGroup) {
    const allImages = openGroup.images || []
    return (
      <>
        <Navbar />
        <ProfileSidebar />
        <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#0a0a0f' }}>
          <div className="max-w-7xl mx-auto">

            {/* Back button + header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <button
                onClick={() => { setOpenGroup(null); fetchData() }}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-6"
              >
                <ArrowLeft size={16} /> Wapas Groups Pe
              </button>

              {/* Group hero */}
              <div className="glass rounded-3xl overflow-hidden">
                <div className="h-40 relative flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#1a0a2e,#0d0a1a)' }}>
                  {allImages[0]?.url && (
                    <img src={allImages[0].url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  )}
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-4xl font-black mx-auto mb-3"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                      {openGroup.name?.[0]?.toUpperCase()}
                    </div>
                    <h1 className="font-display font-black text-white text-3xl">{openGroup.name}</h1>
                    {openGroup.description && (
                      <p className="text-white/50 text-sm mt-1">{openGroup.description}</p>
                    )}
                    <p className="text-white/30 text-xs mt-1">{allImages.length} photos</p>
                  </div>
                </div>

                {/* Add images button */}
                <div className="px-6 py-4 flex justify-end border-t border-white/8">
                  <button
                    onClick={() => setShowImageUpload(openGroup)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}
                  >
                    <Plus size={15} /> Images Add Karo
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Image Gallery */}
            {allImages.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl">
                <ImageIcon size={48} className="mx-auto text-white/15 mb-4" />
                <p className="text-white/40 mb-2">Is group mein abhi koi photo nahi hai</p>
                <p className="text-white/25 text-sm mb-6">Images add karo — admin approve karne ke baad yahan dikhenge</p>
                <button
                  onClick={() => setShowImageUpload(openGroup)}
                  className="btn-primary px-5 py-2.5 rounded-xl text-sm"
                >
                  <Upload size={14} className="inline mr-2" />
                  Pehli Image Add Karo
                </button>
              </div>
            ) : (
              <motion.div
                className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {allImages.map((img, i) => (
                  <motion.div
                    key={i}
                    className="break-inside-avoid mb-3 relative group cursor-pointer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setPreviewImg({ images: allImages, index: i })}
                  >
                    <div className="rounded-2xl overflow-hidden glass">
                      <img
                        src={img.url}
                        alt={img.caption || ''}
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <ZoomIn size={18} className="text-white" />
                        </div>
                      </div>
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl">
                          <p className="text-white text-xs">{img.caption}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>

        {/* Image Upload Modal */}
        <AnimatePresence>
          {showImageUpload && (
            <GroupImageUploadModal
              group={showImageUpload}
              onClose={() => setShowImageUpload(null)}
              onUploaded={() => fetchData(true)}
            />
          )}
        </AnimatePresence>

        {/* Lightbox Preview */}
        <AnimatePresence>
          {previewImg && (
            <LightboxModal
              images={previewImg.images}
              startIndex={previewImg.index}
              onClose={() => setPreviewImg(null)}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  // ── Groups List View (folders) ─────────────────────────────────────
  return (
    <>
      <Navbar />
      <ProfileSidebar />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-7xl mx-auto">

          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2">The Squads</p>
            <h1 className="font-display font-black text-white text-4xl md:text-5xl">Our Groups</h1>
          </motion.div>

          {/* My requests */}
          {myRequests.length > 0 && (
            <div className="mb-6 space-y-2">
              {myRequests.map(r => (
                <motion.div key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
                  <Clock size={14} className="text-white/40 flex-shrink-0" />
                  <p className="text-white/60 text-sm flex-1">
                    Group Request: <span className="text-white font-medium">"{r.name}"</span>
                  </p>
                  <StatusPill status={r.status} />
                  {r.adminReply && (
                    <p className="w-full text-white/40 text-xs pl-5">Admin: "{r.adminReply}"</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <p className="text-white/40 text-sm">{groups.length} groups</p>
              <button onClick={() => fetchData(true)} disabled={refreshing}
                className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors">
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refresh...' : 'Refresh'}
              </button>
            </div>
            {!hasPendingRequest ? (
              <button onClick={() => setShowRequestForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                <Plus size={15} /> Group Banane ki Request Karo
              </button>
            ) : (
              <span className="text-yellow-400 text-sm flex items-center gap-2">
                <Clock size={14} /> Ek request pending hai
              </span>
            )}
          </div>

          {/* Groups as folders */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl h-52 animate-pulse" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-20 glass rounded-2xl">
              <Users2 size={48} className="mx-auto text-white/15 mb-4" />
              <p className="text-white/40 mb-2">Abhi koi group nahi hai</p>
              <p className="text-white/25 text-sm">Group request bhejo — admin approve karenge toh yahan dikhega</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {groups.map((g, i) => (
                <motion.div
                  key={g._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setOpenGroup(g)}
                  className="glass rounded-2xl overflow-hidden cursor-pointer group hover:border-purple-500/40 transition-all hover:-translate-y-1"
                  style={{ transition: 'all 0.2s ease' }}
                >
                  {/* Folder thumbnail — 2x2 grid of images or placeholder */}
                  <div className="relative aspect-square bg-gradient-to-br from-purple-900/30 to-pink-900/20 overflow-hidden">
                    {g.images?.length > 0 ? (
                      <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="overflow-hidden bg-white/5">
                            {g.images[j]?.url ? (
                              <img
                                src={g.images[j].url}
                                alt=""
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full" style={{ background: 'rgba(124,58,237,0.1)' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-2"
                          style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                          {g.name?.[0]?.toUpperCase()}
                        </div>
                        <p className="text-white/30 text-xs">No photos yet</p>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                        Open →
                      </div>
                    </div>
                  </div>

                  {/* Folder label */}
                  <div className="p-3">
                    <p className="text-white font-semibold text-sm truncate">{g.name}</p>
                    <p className="text-white/35 text-xs mt-0.5">{g.images?.length || 0} photos</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Group Request Modal */}
      <AnimatePresence>
        {showRequestForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-strong rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-white text-xl">Group Request Bhejo</h3>
                <button onClick={() => setShowRequestForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>
              <div className="glass rounded-xl p-4 mb-5 border border-yellow-500/20">
                <p className="text-yellow-400 text-xs font-medium mb-1">⚡ How it works</p>
                <p className="text-white/50 text-xs leading-relaxed">
                  Request → Admin approve → Group bane → Tum images add karo → Admin approve → Gallery mein dikhe
                </p>
              </div>
              <form onSubmit={handleGroupRequest} className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Group ka Naam *</label>
                  <input type="text" required value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="CS-A 2024, Friends Gang..." maxLength={80}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Description (Optional)</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} maxLength={400} placeholder="Group ke baare mein..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowRequestForm(false)}
                    className="flex-1 py-3 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/5">Cancel</button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                    {submitting ? 'Bhej rahe hain...' : 'Request Bhejo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Image Upload Modal ─────────────────────────────────────────────
function GroupImageUploadModal({ group, onClose, onUploaded }) {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files)
    if (selected.length > 20) return toast.error('Max 20 images')
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!files.length) return toast.error('Kam se kam ek image select karo')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('groupId', group._id)
      fd.append('caption', caption)
      files.forEach(f => fd.append('images', f))
      await api.post('/users/group-images', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('✅ Images submit! Admin approve karenge.')
      onUploaded()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload fail hua')
    } finally { setUploading(false) }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="glass-strong rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-white text-xl">Images Add Karo</h3>
            <p className="text-white/40 text-xs mt-0.5">Group: <span className="text-purple-300">{group.name}</span></p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <div className="glass rounded-xl p-4 mb-4 border border-purple-500/20">
          <p className="text-purple-400 text-xs font-medium mb-1">📋 Note</p>
          <p className="text-white/50 text-xs">Admin approve karne ke baad gallery mein dikhenge.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Images (Max 20)</label>
            <div className="border-2 border-dashed border-white/15 rounded-xl p-5 text-center cursor-pointer hover:border-purple-500/40 transition-colors"
              onClick={() => document.getElementById('grp-imgs-inp').click()}>
              {previews.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((p, i) => <img key={i} src={p} alt="" className="w-full aspect-square object-cover rounded-lg" />)}
                </div>
              ) : (
                <div><Upload size={24} className="mx-auto text-white/30 mb-2" /><p className="text-white/50 text-sm">Click karo</p></div>
              )}
              <input id="grp-imgs-inp" type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </div>
            {files.length > 0 && <p className="text-white/40 text-xs mt-1">{files.length} selected</p>}
          </div>
          <div>
            <label className="text-white/60 text-sm mb-2 block">Caption (Optional)</label>
            <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Kuch likho..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-white/50 border border-white/10">Cancel</button>
            <button type="submit" disabled={uploading} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
              {uploading ? 'Upload...' : 'Submit Karo'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── Lightbox Preview ───────────────────────────────────────────────
function LightboxModal({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length)
  const next = () => setCurrent(i => (i + 1) % images.length)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close */}
      <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10 transition-colors"
        onClick={onClose}>
        <X size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-sm font-mono">
        {current + 1} / {images.length}
      </div>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          className="absolute left-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10 transition-colors"
          onClick={e => { e.stopPropagation(); prev() }}>
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Image */}
      <motion.div
        key={current}
        className="max-w-5xl max-h-[85vh] px-16"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={images[current].url}
          alt={images[current].caption || ''}
          className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />
        {images[current].caption && (
          <p className="text-white/60 text-sm text-center mt-3">{images[current].caption}</p>
        )}
      </motion.div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          className="absolute right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10 transition-colors"
          onClick={e => { e.stopPropagation(); next() }}>
          <ChevronRight size={22} />
        </button>
      )}

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-4"
          onClick={e => e.stopPropagation()}>
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all"
              style={{ opacity: i === current ? 1 : 0.4, border: i === current ? '2px solid #7c3aed' : '2px solid transparent' }}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function StatusPill({ status }) {
  const map = {
    pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: '⏳ Pending' },
    approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: '✅ Approved' },
    rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '❌ Rejected' },
  }
  const s = map[status] || map.pending
  return <span className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0"
    style={{ background: s.bg, color: s.color }}>{s.label}</span>
}