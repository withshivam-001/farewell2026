'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '../../../components/layout/Navbar'
import ProfileSidebar from '../../../components/layout/ProfileSidebar'
import api from '../../../lib/api'
import useAuthStore from '../../../store/authStore'

export default function EditProfilePage() {
  const { user, updateUser } = useAuthStore()
  const router = useRouter()
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    instagram: user?.socialLinks?.instagram || '',
    linkedin: user?.socialLinks?.linkedin || '',
  })
  const [avatar, setAvatar] = useState(null)
  const [preview, setPreview] = useState(user?.avatar || '')
  const [loading, setLoading] = useState(false)

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('bio', form.bio)
      fd.append('socialLinks', JSON.stringify({ instagram: form.instagram, linkedin: form.linkedin }))
      if (avatar) fd.append('avatar', avatar)

      const { data } = await api.patch('/users/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser(data.user)
      toast.success('Profile update ho gaya!')
      router.push('/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update fail ho gaya')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <ProfileSidebar />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <h1 className="font-display font-black text-white text-3xl">Profile Edit Karo</h1>
            </div>
            <div className="glass rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3 mb-2">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 cursor-pointer" onClick={() => document.getElementById('avatar-input').click()}>
                    {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>{user?.name?.[0]}</div>
                    )}
                  </div>
                  <button type="button" onClick={() => document.getElementById('avatar-input').click()} className="text-purple-400 text-sm hover:text-purple-300 transition-colors">Photo Change Karo</button>
                  <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Naam</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 transition-colors text-sm" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={200} placeholder="Apne baare mein kuch likho..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 transition-colors text-sm resize-none" />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Instagram Username</label>
                  <input type="text" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@yourhandle"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 transition-colors text-sm" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl disabled:opacity-60">
                  {loading ? 'Save ho raha hai...' : 'Profile Save Karo'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
}
