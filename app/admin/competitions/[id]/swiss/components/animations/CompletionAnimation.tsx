'use client'

import { motion } from 'framer-motion'

interface Match {
  homeTeam: {
    id: string
    name: string
  }
  awayTeam: {
    id: string
    name: string
  }
}

interface CompletionAnimationProps {
  matches: Match[]
  onExport: () => void
}

export default function CompletionAnimation({ matches, onExport }: CompletionAnimationProps) {
  return (
    <motion.div
      className="relative min-h-[600px] flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Confetti Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2 }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][i % 4],
              left: `${Math.random() * 100}%`,
              top: '-10px',
            }}
            animate={{
              y: ['0vh', '100vh'],
              x: [0, (Math.random() - 0.5) * 200],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      {/* Completion Message */}
      <motion.div
        className="text-center mb-12"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="text-4xl font-bold text-white mb-4">Draw Complete!</h2>
        <p className="text-gray-300">All matches have been successfully drawn</p>
      </motion.div>

      {/* Matches Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {matches.map((match, index) => (
          <motion.div
            key={`${match.homeTeam.id}-${match.awayTeam.id}`}
            className="bg-gray-800 rounded-lg p-4 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + (index * 0.1) }}
          >
            <div className="flex items-center justify-between">
              <div className="text-right flex-1">
                <span className="font-medium text-white">{match.homeTeam.name}</span>
              </div>
              <div className="mx-4 text-gray-400">vs</div>
              <div className="text-left flex-1">
                <span className="font-medium text-white">{match.awayTeam.name}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Export Button */}
      <motion.button
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onExport}
      >
        Export Results
      </motion.button>

      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-500/20 to-transparent rounded-xl blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
} 