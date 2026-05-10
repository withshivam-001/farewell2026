'use client'

import { useState, useEffect } from 'react'
import GlitchIntro from '../components/sections/GlitchIntro'
import VideoIntro from '../components/sections/VideoIntro'
import Homepage from '../components/sections/Homepage'
import Navbar from '../components/layout/Navbar'
import ProfileSidebar from '../components/layout/ProfileSidebar'
import InstagramPopup from '../components/ui/InstagramPopup'
import useAuthStore from '../store/authStore'

export default function Page() {
  const [phase, setPhase] = useState('glitch') // 'glitch' | 'video' | 'home'
  const { isHydrated } = useAuthStore()

  const handleGlitchDone = () => setPhase('video')
  const handleSkipOrDone = () => setPhase('home')

  if (!isHydrated) return null

  return (
    <>
      {phase === 'glitch' && <GlitchIntro onDone={handleGlitchDone} />}
      {phase === 'video' && <VideoIntro onSkip={handleSkipOrDone} onEnded={handleSkipOrDone} />}
      {phase === 'home' && (
        <>
          <Navbar />
          <Homepage />
          <ProfileSidebar />
          <InstagramPopup />
        </>
      )}
    </>
  )
}
