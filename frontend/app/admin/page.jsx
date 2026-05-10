'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Video, MessageSquare, Image as ImageIcon, TrendingUp,
  CheckCircle, XCircle, Trash2, Star, ToggleLeft, ToggleRight,
  Shield, Upload, Plus, X, Eye, RefreshCw, Bell, Send, Users2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import useAuthStore from '../../store/authStore'
import Navbar from '../../components/layout/Navbar'
import ProfileSidebar from '../../components/layout/ProfileSidebar'

const TABS = ['Overview', 'Users', 'Videos', 'Video Requests', 'Groups', 'Group Images', 'Comments', 'Payments']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview')
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [videos, setVideos] = useState([])
  const [videoRequests, setVideoRequests] = useState([])
  const [groupRequests, setGroupRequests] = useState([])
  const [groups, setGroups] = useState([])
  const [groupImageSubs, setGroupImageSubs] = useState([])
  const [comments, setComments] = useState([])
  const [paymentEnabled, setPaymentEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showVideoUpload, setShowVideoUpload] = useState(false)
  const [replyModal, setReplyModal] = useState(null) // { type, id, title }
  const [replyText, setReplyText] = useState('')
  const [replyStatus, setReplyStatus] = useState('approved')
  const { isAdmin } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAdmin?.()) { router.push('/'); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [a, u, v, vr, gr, gi, c, s] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users?limit=100'),
        api.get('/admin/videos?limit=100'),
        api.get('/admin/upload-requests'),
        api.get('/admin/group-requests'),
        api.get('/admin/group-image-submissions'),
        api.get('/admin/comments?limit=100'),
        api.get('/settings'),
      ])
      setAnalytics(a.data)
      setUsers(u.data.users || [])
      setVideos(v.data.videos || [])
      setVideoRequests(vr.data.requests || [])
      setGroupRequests(gr.data.requests || [])
      setGroupImageSubs(gi.data.submissions || [])
      setComments(c.data.comments || [])
      setPaymentEnabled(s.data.settings?.payment_enabled === true)
    } catch (err) {
      toast.error('Load fail: ' + (err.response?.data?.error || err.message))
    } finally { setLoading(false) }
  }

  // ── User actions ──
  const approveUser = async (id) => {
    try { await api.patch(`/admin/users/${id}/approve`); setUsers(p => p.map(u => u._id === id ? { ...u, isApproved: true } : u)); toast.success('✅ User approved!') } catch { toast.error('Failed') }
  }
  const rejectUser = async (id) => {
    try { await api.patch(`/admin/users/${id}/reject`); setUsers(p => p.map(u => u._id === id ? { ...u, isApproved: false } : u)); toast.success('Unapproved') } catch { toast.error('Failed') }
  }
  const deleteUser = async (id) => {
    if (!confirm('Is user ko delete karo?')) return
    try { await api.delete(`/admin/users/${id}`); setUsers(p => p.filter(u => u._id !== id)); toast.success('Deleted') } catch { toast.error('Failed') }
  }

  // ── Video actions ──
  const deleteVideo = async (id) => {
    if (!confirm('Video permanently delete karo?')) return
    try { await api.delete(`/admin/videos/${id}`); setVideos(p => p.filter(v => v._id !== id)); toast.success('Video deleted') } catch { toast.error('Failed') }
  }
  const featureVideo = async (id, cur) => {
    try { await api.patch(`/admin/videos/${id}/feature`, { featured: !cur }); setVideos(p => p.map(v => v._id === id ? { ...v, isFeatured: !cur } : v)) } catch { toast.error('Failed') }
  }

  // ── Reply modal submit ──
  const submitReply = async () => {
    if (!replyModal) return
    try {
      if (replyModal.type === 'videoRequest') {
        await api.patch(`/admin/upload-requests/${replyModal.id}`, { status: replyStatus, adminReply: replyText })
        setVideoRequests(p => p.map(r => r._id === replyModal.id ? { ...r, status: replyStatus, adminReply: replyText } : r))
        toast.success('Reply bhej di!')
      } else if (replyModal.type === 'groupRequest') {
        if (replyStatus === 'approved') {
          await api.patch(`/admin/group-requests/${replyModal.id}/approve`, { adminReply: replyText })
          toast.success('✅ Group create ho gaya!')
        } else {
          await api.patch(`/admin/group-requests/${replyModal.id}/reject`, { adminReply: replyText })
          toast.success('Request reject kar di')
        }
        setGroupRequests(p => p.map(r => r._id === replyModal.id ? { ...r, status: replyStatus } : r))
      } else if (replyModal.type === 'groupImages') {
        if (replyStatus === 'approved') {
          await api.patch(`/admin/group-image-submissions/${replyModal.id}/approve`, { adminReply: replyText })
          toast.success('✅ Images group mein add ho gayi!')
        } else {
          await api.patch(`/admin/group-image-submissions/${replyModal.id}/reject`, { adminReply: replyText })
          toast.success('Images reject kar di')
        }
        setGroupImageSubs(p => p.map(s => s._id === replyModal.id ? { ...s, status: replyStatus } : s))
      }
      setReplyModal(null); setReplyText(''); setReplyStatus('approved')
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  // ── Comment actions ──
  const deleteComment = async (id) => {
    try { await api.delete(`/admin/comments/${id}`); setComments(p => p.filter(c => c._id !== id)); toast.success('Comment delete ho gaya') } catch { toast.error('Failed') }
  }

  // ── Payment toggle ──
  const togglePayment = async () => {
    try { await api.patch('/settings/payment_enabled', { value: !paymentEnabled }); setPaymentEnabled(!paymentEnabled); toast.success((!paymentEnabled ? 'Payments ON' : 'Payments OFF')) } catch { toast.error('Failed') }
  }

  if (!isAdmin?.()) return null

  const pendingUsers = users.filter(u => !u.isApproved && u.isEmailVerified)
  const pendingVR = videoRequests.filter(r => r.status === 'pending')
  const pendingGR = groupRequests.filter(r => r.status === 'pending')
  const pendingGI = groupImageSubs.filter(s => s.status === 'pending')
  const totalPending = pendingUsers.length + pendingVR.length + pendingGR.length + pendingGI.length

  return (
    <>
      <Navbar />
      <ProfileSidebar />
      <div className="min-h-screen pt-16" style={{ background: '#0a0a0f' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-1">Admin Panel</p>
              <h1 className="font-display font-black text-white text-3xl flex items-center gap-3">
                Dashboard
                {totalPending > 0 && (
                  <span className="text-sm px-2.5 py-1 rounded-full font-mono animate-pulse" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)' }}>
                    {totalPending} pending
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchAll} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors"><RefreshCw size={15} /></button>
              <button onClick={togglePayment} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${paymentEnabled ? 'border-green-500/40 text-green-400 bg-green-500/10' : 'border-white/10 text-white/50 bg-white/5'}`}>
                {paymentEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                Payments {paymentEnabled ? 'ON' : 'OFF'}
              </button>
              <button onClick={() => setShowVideoUpload(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: 'white' }}>
                <Upload size={15} /> Video Upload Karo
              </button>
            </div>
          </div>

          {/* Overview Stats */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
              {[
                { l: 'Users', v: analytics.users.total, c: '#7c3aed', icon: Users },
                { l: 'Pending Users', v: analytics.users.pending, c: '#f59e0b', icon: Shield },
                { l: 'Videos', v: analytics.videos.total, c: '#3b82f6', icon: Video },
                { l: 'Comments', v: analytics.comments, c: '#10b981', icon: MessageSquare },
                { l: 'Groups', v: analytics.groups, c: '#ec4899', icon: Users2 },
                { l: 'Video Req', v: analytics.pendingRequests?.videos || 0, c: '#f97316', icon: Bell },
                { l: 'Group Req', v: analytics.pendingRequests?.groups || 0, c: '#06b6d4', icon: Bell },
                { l: 'Img Review', v: analytics.pendingRequests?.groupImages || 0, c: '#8b5cf6', icon: ImageIcon },
              ].map((s, i) => (
                <motion.div key={s.l} className="glass rounded-xl p-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <s.icon size={14} style={{ color: s.c }} className="mb-2" />
                  <p className="font-bold text-white text-xl">{s.v}</p>
                  <p className="text-white/35 text-xs mt-0.5">{s.l}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 flex-wrap">
            {TABS.map((t) => {
              const badge = t === 'Users' ? pendingUsers.length : t === 'Video Requests' ? pendingVR.length : t === 'Groups' ? pendingGR.length : t === 'Group Images' ? pendingGI.length : 0
              return (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition-all relative whitespace-nowrap"
                  style={tab === t ? { background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: 'white' } : { color: 'rgba(255,255,255,0.45)' }}>
                  {t}
                  {badge > 0 && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/80 text-black font-bold">{badge}</span>}
                </button>
              )
            })}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)}</div>
          ) : (
            <>
              {/* ── USERS TAB ── */}
              {tab === 'Users' && (
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/8 flex items-center justify-between">
                    <p className="text-white font-semibold">{users.length} Users</p>
                    {pendingUsers.length > 0 && <span className="text-yellow-400 text-sm">{pendingUsers.length} approval pending</span>}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-white/8 text-white/30 text-xs font-mono uppercase">
                        <th className="text-left px-5 py-3">User</th>
                        <th className="text-left px-5 py-3 hidden md:table-cell">Email</th>
                        <th className="text-left px-5 py-3">Status</th>
                        <th className="text-right px-5 py-3">Actions</th>
                      </tr></thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                  {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>{u.name?.[0]}</div>}
                                </div>
                                <div><p className="text-white font-medium">{u.name}</p><p className="text-white/30 text-xs capitalize">{u.role}</p></div>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-white/40 hidden md:table-cell">{u.email}</td>
                            <td className="px-5 py-3">
                              <span className="text-xs px-2 py-1 rounded-full" style={{ background: u.isApproved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: u.isApproved ? '#10b981' : '#f59e0b' }}>
                                {u.isApproved ? 'Approved' : u.isEmailVerified ? 'Pending' : 'Unverified'}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-end gap-2">
                                {!u.isApproved && u.role !== 'admin' && <button onClick={() => approveUser(u._id)} title="Approve" className="text-green-400 hover:text-green-300 transition-colors"><CheckCircle size={16} /></button>}
                                {u.isApproved && u.role !== 'admin' && <button onClick={() => rejectUser(u._id)} title="Revoke" className="text-yellow-400 hover:text-yellow-300 transition-colors"><XCircle size={16} /></button>}
                                {u.role !== 'admin' && <button onClick={() => deleteUser(u._id)} title="Delete" className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={14} /></button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── VIDEOS TAB ── */}
              {tab === 'Videos' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white/50 text-sm">{videos.length} videos</p>
                    <button onClick={() => setShowVideoUpload(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: 'white' }}>
                      <Plus size={15} /> Naya Video Upload Karo
                    </button>
                  </div>
                  {videos.length === 0 ? (
                    <div className="text-center py-20 glass rounded-2xl">
                      <Video size={40} className="mx-auto text-white/20 mb-3" />
                      <p className="text-white/40">Abhi koi video nahi hai</p>
                      <button onClick={() => setShowVideoUpload(true)} className="mt-4 btn-primary px-5 py-2 rounded-xl text-sm">Pehla Video Upload Karo</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {videos.map(v => (
                        <div key={v._id} className="glass rounded-2xl overflow-hidden">
                          <div className="relative aspect-video bg-white/5">
                            {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><Video size={28} /></div>}
                            <div className="absolute top-2 left-2 flex gap-1">
                              {!v.isApproved && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/80 text-black font-bold">Pending</span>}
                              {v.isFeatured && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/80 text-white">Featured</span>}
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-white font-medium text-sm truncate">{v.title}</p>
                            <p className="text-white/35 text-xs mt-0.5">{v.uploadedBy?.name} · {v.views} views</p>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <button onClick={() => featureVideo(v._id, v.isFeatured)} className={`text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${v.isFeatured ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                                <Star size={11} />{v.isFeatured ? 'Unfeature' : 'Feature'}
                              </button>
                              <button onClick={() => deleteVideo(v._id)} className="ml-auto text-red-400 hover:text-red-300 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── VIDEO REQUESTS TAB ── */}
              {tab === 'Video Requests' && (
                <div className="space-y-4">
                  {videoRequests.length === 0 ? (
                    <div className="text-center py-16 glass rounded-2xl text-white/30"><Bell size={32} className="mx-auto mb-3 text-white/20" /><p>Koi video request nahi aayi abhi</p></div>
                  ) : videoRequests.map(r => (
                    <div key={r._id} className="glass rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                            {r.user?.avatar ? <img src={r.user.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>{r.user?.name?.[0]}</div>}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{r.user?.name}</p>
                            <p className="text-white/40 text-xs">{r.user?.email} · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-4 space-y-2">
                        <p className="text-white font-medium">📹 {r.title}</p>
                        {r.description && <p className="text-white/50 text-sm">{r.description}</p>}
                        <a href={r.driveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                          🔗 Google Drive Link Dekho
                        </a>
                        <p className="text-white/30 text-xs">Category: {r.category}</p>
                      </div>
                      {r.adminReply && <div className="mt-3 px-4 py-3 rounded-xl bg-white/5 text-white/60 text-sm"><span className="text-purple-400 font-medium">Admin reply: </span>{r.adminReply}</div>}
                      {r.status === 'pending' && (
                        <button onClick={() => { setReplyModal({ type: 'videoRequest', id: r._id, title: r.title }); setReplyStatus('approved') }}
                          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                          <Send size={13} /> Review & Reply Karo
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── GROUPS TAB ── */}
              {tab === 'Groups' && (
                <div className="space-y-4">
                  <div className="glass rounded-2xl p-4 border border-yellow-500/20">
                    <p className="text-yellow-400 font-semibold text-sm mb-1">📋 Group Creation Requests</p>
                    <p className="text-white/40 text-xs">Users yahan se group banane ki request karte hain. Approve karo toh group create ho jayega.</p>
                  </div>
                  {groupRequests.length === 0 ? (
                    <div className="text-center py-16 glass rounded-2xl text-white/30"><Users2 size={32} className="mx-auto mb-3 text-white/20" /><p>Koi group request nahi aayi abhi</p></div>
                  ) : groupRequests.map(r => (
                    <div key={r._id} className="glass rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                            {r.user?.avatar ? <img src={r.user.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>{r.user?.name?.[0]}</div>}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{r.user?.name}</p>
                            <p className="text-white/40 text-xs">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-3">
                        <p className="text-white font-medium">👥 Group Name: <span className="text-purple-300">{r.name}</span></p>
                        {r.description && <p className="text-white/50 text-sm mt-1">{r.description}</p>}
                      </div>
                      {r.adminReply && <div className="mt-3 px-4 py-3 rounded-xl bg-white/5 text-white/60 text-sm"><span className="text-purple-400 font-medium">Admin reply: </span>{r.adminReply}</div>}
                      {r.status === 'pending' && (
                        <button onClick={() => { setReplyModal({ type: 'groupRequest', id: r._id, title: r.name }); setReplyStatus('approved') }}
                          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                          <Send size={13} /> Review Karo (Approve/Reject)
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── GROUP IMAGES TAB ── */}
              {tab === 'Group Images' && (
                <div className="space-y-4">
                  <div className="glass rounded-2xl p-4 border border-purple-500/20">
                    <p className="text-purple-400 font-semibold text-sm mb-1">🖼️ Group Image Submissions</p>
                    <p className="text-white/40 text-xs">Users ne approved groups mein images submit ki hain. Approve karo toh group mein dikhne lagengi.</p>
                  </div>
                  {groupImageSubs.length === 0 ? (
                    <div className="text-center py-16 glass rounded-2xl text-white/30"><ImageIcon size={32} className="mx-auto mb-3 text-white/20" /><p>Koi image submission nahi aayi abhi</p></div>
                  ) : groupImageSubs.map(s => (
                    <div key={s._id} className="glass rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                            {s.uploadedBy?.avatar ? <img src={s.uploadedBy.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>{s.uploadedBy?.name?.[0]}</div>}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{s.uploadedBy?.name}</p>
                            <p className="text-white/40 text-xs">Group: <span className="text-purple-300">{s.group?.name}</span> · {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}</p>
                          </div>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      {s.caption && <p className="text-white/50 text-sm mb-3">"{s.caption}"</p>}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
                        {s.images?.map((img, i) => <img key={i} src={img.url} alt="" className="w-full aspect-square object-cover rounded-xl" />)}
                      </div>
                      {s.adminReply && <div className="px-4 py-3 rounded-xl bg-white/5 text-white/60 text-sm mb-3"><span className="text-purple-400 font-medium">Admin reply: </span>{s.adminReply}</div>}
                      {s.status === 'pending' && (
                        <button onClick={() => { setReplyModal({ type: 'groupImages', id: s._id, title: `${s.images?.length} images` }); setReplyStatus('approved') }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                          <Send size={13} /> Review Karo
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── COMMENTS TAB ── */}
              {tab === 'Comments' && (
                <div className="space-y-3">
                  {comments.length === 0 ? <div className="text-center py-16 glass rounded-2xl text-white/30"><MessageSquare size={32} className="mx-auto mb-3" /><p>Koi comment nahi</p></div>
                    : comments.map(c => (
                      <div key={c._id} className="glass rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          {c.author?.avatar ? <img src={c.author.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>{c.author?.name?.[0]}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-sm font-medium">{c.author?.name} <span className="text-white/25 font-normal text-xs">· {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span></p>
                          <p className="text-white/55 text-sm mt-1 break-words">{c.text}</p>
                        </div>
                        <button onClick={() => deleteComment(c._id)} className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"><Trash2 size={15} /></button>
                      </div>
                    ))}
                </div>
              )}

              {/* ── PAYMENTS TAB ── */}
              {tab === 'Payments' && (
                <div className="glass rounded-2xl p-8 text-center">
                  <TrendingUp size={40} className="mx-auto text-purple-400 mb-4" />
                  <h3 className="font-display font-bold text-white text-xl mb-2">Payment System</h3>
                  <p className="text-white/40 text-sm">Total paid users: <span className="text-white font-semibold">{analytics?.payments || 0}</span></p>
                  <p className="text-white/40 text-sm mt-1">Status: <span className={paymentEnabled ? 'text-green-400' : 'text-red-400'}>{paymentEnabled ? '✅ Active' : '❌ Disabled'}</span></p>
                  <button onClick={togglePayment} className="btn-primary mt-6 px-6 py-2.5 rounded-xl text-sm">
                    {paymentEnabled ? 'Payments Band Karo' : 'Payments Chalu Karo'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── VIDEO UPLOAD MODAL ── */}
      <AnimatePresence>
        {showVideoUpload && <VideoUploadModal onClose={() => setShowVideoUpload(false)} onUploaded={(v) => { setVideos(p => [v, ...p]); setShowVideoUpload(false); toast.success('✅ Video upload ho gaya!') }} />}
      </AnimatePresence>

      {/* ── REPLY MODAL ── */}
      <AnimatePresence>
        {replyModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-strong rounded-2xl p-6 w-full max-w-md" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white text-lg">Review Karo</h3>
                <button onClick={() => setReplyModal(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
              </div>
              <p className="text-white/50 text-sm mb-4">"{replyModal.title}"</p>

              <div className="flex gap-2 mb-4">
                {['approved', 'rejected'].map(s => (
                  <button key={s} onClick={() => setReplyStatus(s)}
                    className="flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all"
                    style={replyStatus === s ? { background: s === 'approved' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)', color: s === 'approved' ? '#10b981' : '#ef4444', border: `1px solid ${s === 'approved' ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}` } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {s === 'approved' ? '✅ Approve' : '❌ Reject'}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-white/60 text-sm mb-2 block">User ko reply/message (optional)</label>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="User ko kuch batana chahte ho..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/50 text-sm resize-none" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setReplyModal(null)} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={submitReply} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>Submit Karo</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Video Upload Modal ─────────────────────────────────────────────
function VideoUploadModal({ onClose, onUploaded }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'farewell' })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbFile, setThumbFile] = useState(null)
  const [thumbPreview, setThumbPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleThumb = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setThumbFile(f)
    setThumbPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!videoFile) return toast.error('Video file select karo')
    if (!form.title) return toast.error('Title daalo')

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('video', videoFile)
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('category', form.category)

      const { data } = await api.post('/admin/videos/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
      })

      // Upload thumbnail if provided
      if (thumbFile && data.video?._id) {
        const tfd = new FormData()
        tfd.append('thumbnail', thumbFile)
        tfd.append('videoId', data.video._id)
        await api.post('/admin/videos/thumbnail', tfd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }

      onUploaded(data.video)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload fail hua')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="glass-strong rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-white text-xl">Video Upload Karo</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-sm mb-2 block">Title *</label>
            <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Video ka naam..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm" />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Video ke baare mein..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm resize-none" />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-2 block">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/60 text-sm">
              {['farewell', 'memories', 'highlights', 'other'].map(c => <option key={c} value={c} className="bg-gray-900 capitalize">{c}</option>)}
            </select>
          </div>

          {/* Video file */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Video File * (MP4, MOV)</label>
            <div className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center hover:border-purple-500/40 transition-colors cursor-pointer" onClick={() => document.getElementById('video-file').click()}>
              {videoFile ? (
                <div><Video size={24} className="mx-auto text-purple-400 mb-2" /><p className="text-white text-sm font-medium">{videoFile.name}</p><p className="text-white/40 text-xs">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p></div>
              ) : (
                <div><Upload size={24} className="mx-auto text-white/30 mb-2" /><p className="text-white/50 text-sm">Click karke video select karo</p><p className="text-white/25 text-xs mt-1">MP4, MOV, AVI, WEBM</p></div>
              )}
              <input id="video-file" type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files[0])} />
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">Thumbnail (Optional)</label>
            <div className="border-2 border-dashed border-white/15 rounded-xl p-4 text-center hover:border-purple-500/40 transition-colors cursor-pointer" onClick={() => document.getElementById('thumb-file').click()}>
              {thumbPreview ? (
                <img src={thumbPreview} alt="" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <div><ImageIcon size={20} className="mx-auto text-white/30 mb-1" /><p className="text-white/40 text-xs">Thumbnail image add karo</p></div>
              )}
              <input id="thumb-file" type="file" accept="image/*" className="hidden" onChange={handleThumb} />
            </div>
          </div>

          {/* Progress bar */}
          {uploading && progress > 0 && (
            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1"><span>Upload ho raha hai...</span><span>{progress}%</span></div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#db2777)' }} />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={uploading} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
              {uploading ? `Upload ho raha hai... ${progress}%` : 'Upload Karo'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = { pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)', label: '⏳ Pending' }, approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.3)', label: '✅ Approved' }, rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)', label: '❌ Rejected' } }
  const s = map[status] || map.pending
  return <span className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
}
