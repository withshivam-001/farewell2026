'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Clock, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../../../components/layout/Navbar'
import api from '../../../lib/api'

const CATEGORIES = ['farewell', 'memories', 'highlights', 'other']

export default function UploadRequestPage() {
  const [form, setForm] = useState({ title: '', description: '', driveUrl: '', category: 'farewell' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [myRequests, setMyRequests] = useState([])
  const [fetching, setFetching] = useState(true)
  const router = useRouter()

  useEffect(() => {
    api.get('/users/my-requests').then(({ data }) => setMyRequests(data.requests || [])).catch(() => {}).finally(() => setFetching(false))
  }, [])

  const hasPending = myRequests.some(r => r.status === 'pending')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title daalo')
    if (!form.driveUrl.trim()) return toast.error('Google Drive URL daalo')
    if (!form.driveUrl.includes('drive.google.com')) return toast.error('Valid Google Drive URL hona chahiye')
    setLoading(true)
    try {
      const { data } = await api.post('/users/upload-request', form)
      setMyRequests(p => [data.request, ...p])
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request fail ho gaya')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">📤</div>
              <h1 className="font-display font-black text-white text-3xl">Video Upload Request</h1>
              <p className="text-white/40 mt-2 text-sm">Admin ko apna video ka Google Drive link bhejo</p>
            </div>

            {/* How it works */}
            <div className="glass rounded-xl p-5 mb-6 border border-purple-500/20">
              <p className="text-purple-400 font-semibold text-sm mb-3">⚡ How it works</p>
              <div className="space-y-2">
                {[
                  '1️⃣ Apna video Google Drive mein upload karo',
                  '2️⃣ "Anyone with link" sharing on karo',
                  '3️⃣ Yahan link paste karo + details bharo',
                  '4️⃣ Admin review karega aur reply karega',
                  '5️⃣ Admin video site pe upload karega',
                ].map((s, i) => <p key={i} className="text-white/50 text-xs">{s}</p>)}
              </div>
            </div>

            {/* Past requests */}
            {!fetching && myRequests.length > 0 && (
              <div className="mb-6 space-y-3">
                <p className="text-white/40 text-xs font-mono uppercase tracking-wider">Meri Requests</p>
                {myRequests.map(r => (
                  <div key={r._id} className="glass rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white font-medium text-sm">{r.title}</p>
                        <a href={r.driveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs flex items-center gap-1 mt-0.5 hover:text-blue-300"><ExternalLink size={10} />Drive Link</a>
                      </div>
                      <StatusPill status={r.status} />
                    </div>
                    {r.adminReply && <div className="mt-3 px-3 py-2 rounded-lg bg-white/5 text-white/60 text-xs"><span className="text-purple-400 font-medium">Admin: </span>{r.adminReply}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Form */}
            {hasPending ? (
              <div className="glass rounded-2xl p-6 text-center">
                <Clock size={32} className="mx-auto text-yellow-400 mb-3" />
                <p className="text-white font-semibold mb-2">Request pending hai</p>
                <p className="text-white/40 text-sm">Pehle wali request admin review kar raha hai. Tab tak wait karo.</p>
                <button onClick={() => router.push('/')} className="btn-primary mt-4 px-5 py-2 rounded-xl text-sm">Home Pe Jao</button>
              </div>
            ) : done ? (
              <div className="glass rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-white font-semibold mb-2">Request bhej di!</p>
                <p className="text-white/40 text-sm">Admin review karenge aur tumhe reply karenge.</p>
                <button onClick={() => router.push('/')} className="btn-primary mt-4 px-5 py-2 rounded-xl text-sm">Home Pe Jao</button>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Video Title *</label>
                    <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Video ka naam..." maxLength={120}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm" />
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Google Drive URL *</label>
                    <input type="url" required value={form.driveUrl} onChange={e => setForm({ ...form, driveUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm" />
                    <p className="text-white/25 text-xs mt-1">⚠️ Make sure "Anyone with link" access ON hai</p>
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/60 text-sm">
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900 capitalize">{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Description / Message to Admin</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} maxLength={1000}
                      placeholder="Admin ko batao — video kiske baare mein hai, kab ka hai, kuch special note..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 text-sm resize-none" />
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl disabled:opacity-60">
                    {loading ? 'Bhej rahe hain...' : 'Request Bhejo'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  )
}

function StatusPill({ status }) {
  const map = { pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: '⏳ Pending' }, approved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: '✅ Approved' }, rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '❌ Rejected' } }
  const s = map[status] || map.pending
  return <span className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap" style={{ background: s.bg, color: s.color }}>{s.label}</span>
}
