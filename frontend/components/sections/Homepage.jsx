'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import HeroSection from './HeroSection'
import FeaturedVideos from './FeaturedVideos'
import MemoriesPreview from './MemoriesPreview'
import GroupsPreview from './GroupsPreview'
import BatchStats from './BatchStats'
import FooterSection from './FooterSection'

export default function Homepage() {
  return (
    <main className="min-h-screen" style={{ paddingTop: 64 }}>
      <HeroSection />
      <BatchStats />
      <FeaturedVideos />
      <MemoriesPreview />
      <GroupsPreview />
      <FooterSection />
    </main>
  )
}
