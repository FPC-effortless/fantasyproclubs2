'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Team {
  id: string
  name: string
}

interface Match {
  homeTeam: Team
  awayTeam: Team
}

interface DrawStageProps {
  currentTeam?: Team
  eligibleOpponents: Team[]
  onOpponentSelected: (opponent: Team) => void
  matches: Match[]
  isSelecting: boolean
}

export default function DrawStage({
  currentTeam,
  eligibleOpponents,
  onOpponentSelected,
  matches,
  isSelecting
}: DrawStageProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<Team | null>(null)
  const [showWheel, setShowWheel] = useState(false)

  useEffect(() => {
    if (isSelecting && eligibleOpponents.length > 0) {
      setShowWheel(true)
      const randomIndex = Math.floor(Math.random() * eligibleOpponents.length)
      const timer = setTimeout(() => {
        setSelectedOpponent(eligibleOpponents[randomIndex])
        setTimeout(() => {
          onOpponentSelected(eligibleOpponents[randomIndex])
          setShowWheel(false)
          setSelectedOpponent(null)
        }, 2000)
      }, 3000)
      return () => clearTimeout(timer)
    }
    return () => {} // Return empty cleanup function for other paths
  }, [isSelecting, eligibleOpponents, onOpponentSelected])

  return (
    <div className="relative w-full max-w-4xl mx-auto min-h-[500px] flex flex-col items-center justify-center p-8">
      {/* Current Team Display */}
      <AnimatePresence>
        {currentTeam && (
          <motion.div
            key="current-team"
            className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 rounded-lg p-6 shadow-lg"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h3 className="text-2xl font-bold text-white">{currentTeam.name}</h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draw Wheel */}
      <AnimatePresence>
        {showWheel && (
          <motion.div
            className="relative w-80 h-80"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              rotate: [0, 720, 1080, 720]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: 3,
              ease: "easeInOut",
              rotate: {
                duration: 3,
                ease: "easeInOut",
                times: [0, 0.6, 0.8, 1]
              }
            }}
          >
            <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent animate-spin" />
            {eligibleOpponents.map((team, index) => (
              <motion.div
                key={team.id}
                className="absolute w-full text-center"
                style={{
                  transform: `rotate(${(360 / eligibleOpponents.length) * index}deg)`,
                }}
              >
                <span className="inline-block text-lg font-medium text-white transform -rotate-90 whitespace-nowrap">
                  {team.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Opponent */}
      <AnimatePresence>
        {selectedOpponent && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 rounded-lg p-6 shadow-lg"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h3 className="text-2xl font-bold text-white">{selectedOpponent.name}</h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Matches List */}
      <motion.div
        className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-gray-800 rounded-lg p-6 shadow-lg max-h-[80vh] overflow-y-auto"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold mb-4">Matches</h3>
        <div className="space-y-3">
          <AnimatePresence>
            {matches.map((match, index) => (
              <motion.div
                key={`${match.homeTeam.id}-${match.awayTeam.id}`}
                className="bg-gray-700 rounded-lg p-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-base">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-8 right-8 h-3 bg-gray-700 rounded-full overflow-hidden"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: matches.length / (eligibleOpponents.length * 2) }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="h-full bg-blue-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </div>
  )
} 