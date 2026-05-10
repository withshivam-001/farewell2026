'use client'
import { motion } from 'framer-motion'
import Navbar from '../../components/layout/Navbar'
import ProfileSidebar from '../../components/layout/ProfileSidebar'

const TIMELINE = [
  { year: 'July 2024', title: 'The Beginning', desc: 'New faces, new dreams — the 2024–26 batch takes its first steps together.' },
  { year: 'Oct 2024', title: 'First Semester', desc: 'Late nights, group projects, and the bonds that quietly started forming.' },
  { year: 'Jan 2025', title: 'Finding Our Rhythm', desc: 'Friendships deepened. The batch began to feel like family.' },
  { year: 'Jun 2025', title: 'Halfway There', desc: 'Achievements, setbacks, laughter, and growth — all of it ours.' },
  { year: 'Dec 2025', title: 'The Final Stretch', desc: 'Racing toward the finish line, with everything we have learned.' },
  { year: 'Jun 2026', title: 'Farewell', desc: 'Not an ending — just the beginning of a new chapter, separately together.' },
]

export default function BatchPage() {
  return (
    <>
      <Navbar />
      <ProfileSidebar />
      <main className="min-h-screen pt-20 pb-20 px-4" style={{ background: '#0a0a0f' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2">Our Journey</p>
            <h1 className="font-display font-black text-white leading-tight" style={{ fontSize: 'clamp(3rem,10vw,6rem)' }}>
              2024<span className="text-white/20">–</span>26
            </h1>
            <p className="text-white/40 mt-3 max-w-md mx-auto">Two years that changed everything. This is our story.</p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, #7c3aed, #db2777, transparent)' }} />
            <div className="space-y-10 pl-16">
              {TIMELINE.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative">
                  <div className="absolute -left-[46px] w-4 h-4 rounded-full border-2 border-purple-500 top-1" style={{ background: '#0a0a0f' }}>
                    <div className="w-2 h-2 rounded-full mx-auto mt-[3px]" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }} />
                  </div>
                  <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">{item.year}</span>
                  <h3 className="font-display font-bold text-white text-xl mt-1 mb-2">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <motion.div className="mt-20 text-center glass rounded-3xl p-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="font-display font-bold text-white/80 text-2xl leading-relaxed italic">
              "We came as students. We leave as friends. We carry this batch in our hearts — always."
            </p>
            <p className="text-white/30 font-mono text-sm mt-4">— Farewell 2024–26</p>
          </motion.div>
        </div>
      </main>
    </>
  )
}
