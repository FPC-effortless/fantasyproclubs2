'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function WelcomeAnimation({ onComplete }: { onComplete: () => void }) {
  const [showLogo, setShowLogo] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false)
      onComplete()
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div 
      className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: showLogo ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: [0.8, 1.1, 1],
          opacity: [0, 1, showLogo ? 1 : 0]
        }}
        transition={{ 
          duration: 1.5,
          times: [0, 0.6, 1],
          ease: "easeOut"
        }}
      >
        <motion.div 
          className="absolute inset-0 bg-blue-500 rounded-full blur-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 1],
            opacity: [0, 0.3, 0]
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.6, 1],
            ease: "easeOut"
          }}
        />
        <h1 className="text-4xl font-bold text-white">
          Swiss Model Draw
        </h1>
      </motion.div>
    </motion.div>
  )
} 