'use client'

import { useState, useEffect } from 'react'
import SwissConfig from './SwissConfig'
import VisualDraw from './VisualDraw'
import TeamList from './TeamList'
import { toast } from 'react-hot-toast'

interface SwissModelContentProps {
  competitionId: string
}

export default function SwissModelContent({ competitionId }: SwissModelContentProps) {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isDrawStarted, setIsDrawStarted] = useState(false)

  useEffect(() => {
    console.log('SwissModelContent state:', { isConfigured, isDrawStarted })
  }, [isConfigured, isDrawStarted])

  const handleConfigured = () => {
    console.log('Configuration completed')
    setIsConfigured(true)
  }

  const handleStartDraw = () => {
    console.log('Starting draw')
    setIsDrawStarted(true)
  }

  const handleDrawComplete = () => {
    console.log('Draw completed')
    setIsDrawStarted(false)
    setIsConfigured(false)
    toast.success('Draw completed successfully')
  }

  const handleBack = () => {
    if (isDrawStarted) {
      console.log('Going back to team list')
      setIsDrawStarted(false)
    } else {
      console.log('Going back to configuration')
      setIsConfigured(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Swiss Model Competition</h1>
      
      {!isConfigured ? (
        <SwissConfig
          competitionId={competitionId}
          onConfigured={handleConfigured}
        />
      ) : !isDrawStarted ? (
        <TeamList
          competitionId={competitionId}
          onStartDraw={handleStartDraw}
          onBack={handleBack}
        />
      ) : (
        <VisualDraw
          competitionId={competitionId}
          onComplete={handleDrawComplete}
          onBack={handleBack}
        />
      )}
    </div>
  )
} 