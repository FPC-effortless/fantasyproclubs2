'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Team } from '@/types/database'

interface TeamPotProps {
  teams: Team[]
  title: string
  selectedTeam?: Team
  onTeamSelect?: (team: Team) => void
  isActive?: boolean
}

export default function TeamPot({
  teams,
  title,
  selectedTeam,
  onTeamSelect,
  isActive = false
}: TeamPotProps) {
  return (
    <motion.div
      className={`
        relative rounded-lg p-4 bg-gray-800 border-2
        ${isActive ? 'border-blue-500' : 'border-gray-700'}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3
        className="text-lg font-semibold mb-4 text-center"
        animate={{
          color: isActive ? '#3B82F6' : '#FFFFFF'
        }}
      >
        {title}
      </motion.h3>

      <div className="grid grid-cols-2 gap-2">
        <AnimatePresence>
          {teams.map((team) => (
            <motion.div
              key={team.id}
              className={`
                p-2 rounded cursor-pointer transition-colors
                ${selectedTeam?.id === team.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: selectedTeam?.id === team.id ? -5 : 0
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onTeamSelect?.(team)}
            >
              <motion.div
                className="text-sm font-medium text-center"
                animate={{
                  color: selectedTeam?.id === team.id ? '#FFFFFF' : '#E5E7EB'
                }}
              >
                {team.name}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isActive && (
        <motion.div
          className="absolute -inset-1 -z-10 bg-blue-500/20 rounded-lg blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  )
} 