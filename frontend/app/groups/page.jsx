'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, X, Image as ImageIcon, Upload, Clock } from 'lucide-react'
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
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(null) // group object
  const [form, setForm] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const { isApproved, user } = useAuthStore()

  useEffect(() => {
    if (!isApproved?.()) return
    Promise.all([
      api.get('/groups').then(d => setGroups(d.data.groups || [])),
      api.get('/users/my-group-requests').then(d => setMyRequests(d.data.requests || [])),
    ]).finally(() => setLoading(false))
  }, [])

  if (!isApproved?.()) return (<><Navbar /><PendingApprovalGate /><ProfileSidebar /></>)

  const hasPendingRequest = myRequests.some(r => r.status === 'pending')

  const handleGroupRequest = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Group ka naam daalo')
    setSubmitting(true)
    try {
      const { data } = await api.post('/users/group-request', form)
      setMyRequests(p => [data.request, ...p])
      setShowRequestForm(false)
      setForm({ name: '', description: '' })
      toast.success('✅ Group request bhej di! Admin approve karenge.')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSubmitting(false) }
  }

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

          {/* My requests status */}
          {myRequests.length > 0 && (
            <div className="mb-6 space-y-2">
              {myRequests.map(r => (
                <div key={r._id} className="glass rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
                  <Clock size={14} className="text-white/40" />
                  <p className="text-white/60 text-sm flex-1">Group Request: <span className="text-white font-medium">"{r.name}"</span></p>
                  <StatusPill status={r.status} />
                  {r.adminReply && <p className="w-full text-white/40 text-xs pl-5">Admin: "{r.adminReply}"</p>}
                </div>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-white/40 text-sm">{groups.length} groups</p>
            {!hasPendingRequest && (
              <button onClick={() => setShowRequestForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                <Plus size={15} /> Group Banane ki Request Karo
              </button>
            )}
            {hasPendingRequest && (
              <span className="text-yellow-400 text-sm flex items-center gap-2"><Clock size={14} /> Ek request already pending hai</span>
            )}
          </div>

          {/* Groups grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass rounded-2xl h-48 animate-pulse" />)}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-20 text-white/30"><p className="text-4xl mb-3">👥</p><p>Abhi koi group nahi hai. Pehle group request bhejo!</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((g, i) => (
                <motion.div key={g._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="glass rounded-2xl overflow-hidden hover:border-purple-500/30 transition-colors">
                  {/* Cover / avatar */}
                  <div className="h-20 relative" style={{ background: 'linear-gradient(135deg,#1a0a2e,#0d0a1a)' }}>
                    {g.images?.[0]?.url && <img src={g.images[0].url} alt="" className="w-full h-full object-cover opacity-40" />}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {g.avatar ? (
                        <img src={g.avatar} alt={g.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>{g.name?.[0]}</div>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-white text-lg text-center">{g.name}</h3>
                    {g.description && <p className="text-white/40 text-sm text-center mt-1 line-clamp-2">{g.description}</p>}

                    {/* Images preview */}
                    {g.images?.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-1">
                        {g.images.slice(0, 4).map((img, j) => (
                          <img key={j} src={img.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                    <p className="text-white/25 text-xs text-center mt-2">{g.images?.length || 0} photos</p>

                    {/* Add images button */}
                    <button onClick={() => setShowImageUpload(g)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors">
                      <ImageIcon size={14} /> Images Add Karo
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Group Request Form Modal */}
      <AnimatePresence>
        {showRequestForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-strong rounded-2xl p-6 w-full max-w-md" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-white text-xl">Group Request Bhejo</h3>
                <button onClick={() => setShowRequestForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>
              <div className="glass rounded-xl p-4 mb-5 border border-yellow-500/20">
                <p className="text-yellow-400 text-xs font-medium mb-1">⚡ How it works</p>
                <p className="text-white/50 text-xs">Tumhara group request admin ke paas jayega. Approve hone ke baad group create ho jayega aur tum usme images add kar paoge.</p>
              </div>
              <form onSubmit={handleGroupRequest} className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Group ka Naam *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jaise: CS-A 2024, Friends Gang..." maxLength={80}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Description (Optional)</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} maxLength={400} placeholder="Group ke baare mein kuch batao..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowRequestForm(false)} className="flex-1 py-3 rounded-xl text-sm text-white/50 border border-white/10">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                    {submitting ? 'Bhej rahe hain...' : 'Request Bhejo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Upload Modal */}
      <AnimatePresence>
        {showImageUpload && (
          <GroupImageUploadModal group={showImageUpload} onClose={() => setShowImageUpload(null)} />
        )}
      </AnimatePresence>
    </>
  )
}

function GroupImageUploadModal({ group, onClose }) {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files)
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
      toast.success('✅ Images submit ho gayi! Admin review ke baad group mein dikhenge.')
      onClose()
    } catch (err) { toast.error(err.response?.data?.error || 'Upload fail hua') }
    finally { setUploading(false) }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="glass-strong rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-white text-xl">Images Add Karo</h3>
            <p className="text-white/40 text-xs mt-0.5">Group: {group.name}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>
        <div className="glass rounded-xl p-4 mb-5 border border-purple-500/20">
          <p className="text-purple-400 text-xs font-medium mb-1">📋 Note</p>
          <p className="text-white/50 text-xs">Images pehle admin review mein jayengi. Approve hone ke baad group mein dikhne lagengi.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Images Select Karo * (Max 20)</label>
            <div className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center hover:border-purple-500/40 transition-colors cursor-pointer" onClick={() => document.getElementById('group-imgs').click()}>
              {previews.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((p, i) => <img key={i} src={p} alt="" className="w-full aspect-square object-cover rounded-lg" />)}
                </div>
              ) : (
                <div><Upload size={24} className="mx-auto text-white/30 mb-2" /><p className="text-white/50 text-sm">Click karke images select karo</p><p className="text-white/25 text-xs">JPG, PNG, WEBP · Max 20 photos</p></div>
              )}
              <input id="group-imgs" type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </div>
            {files.length > 0 && <p className="text-white/40 text-xs mt-1">{files.length} images selected</p>}
          </div>
          <div>
            <label className="text-white/60 text-sm mb-2 block">Caption (Optional)</label>
            <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Kuch likho in photos ke baare mein..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-white/50 border border-white/10">Cancel</button>
            <button type="submit" disabled={uploading} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
              {uploading ? 'Upload ho raha hai...' : 'Submit Karo'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function StatusPill({ status }) {
  const map = { pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: '⏳ Pending' }, approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: '✅ Approved' }, rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '❌ Rejected' } }
  const s = map[status] || map.pending
  return <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
}
