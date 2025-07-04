'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Target, TrendingUp, Award, BookOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"

interface TrainingSession {
  id: string
  name: string
  description: string
  duration: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: 'Technical' | 'Tactical' | 'Physical' | 'Mental'
  completed: boolean
  progress: number
}

interface SkillProgress {
  skill: string
  currentLevel: number
  maxLevel: number
  progress: number
  lastTraining: string
}

export default function PlayerTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([])
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [playerId, setPlayerId] = useState<string>('')

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params
      setPlayerId(id)
      loadTrainingData(id)
    }
    loadParams()
  }, [params])

  const loadTrainingData = async (id: string) => {
    try {
      const supabase = createClient()
      
      // Mock data for training sessions
      const mockSessions: TrainingSession[] = [
        {
          id: '1',
          name: 'Ball Control Mastery',
          description: 'Improve first touch and ball control under pressure',
          duration: 45,
          difficulty: 'Intermediate',
          category: 'Technical',
          completed: false,
          progress: 0
        },
        {
          id: '2',
          name: 'Positional Awareness',
          description: 'Learn to read the game and position yourself effectively',
          duration: 60,
          difficulty: 'Advanced',
          category: 'Tactical',
          completed: true,
          progress: 100
        },
        {
          id: '3',
          name: 'Speed and Agility',
          description: 'Enhance acceleration, deceleration, and change of direction',
          duration: 30,
          difficulty: 'Beginner',
          category: 'Physical',
          completed: false,
          progress: 25
        },
        {
          id: '4',
          name: 'Mental Toughness',
          description: 'Build resilience and focus under pressure',
          duration: 40,
          difficulty: 'Intermediate',
          category: 'Mental',
          completed: false,
          progress: 0
        }
      ]

      const mockSkills: SkillProgress[] = [
        { skill: 'Dribbling', currentLevel: 7, maxLevel: 10, progress: 70, lastTraining: '2024-01-15' },
        { skill: 'Passing', currentLevel: 8, maxLevel: 10, progress: 80, lastTraining: '2024-01-14' },
        { skill: 'Shooting', currentLevel: 6, maxLevel: 10, progress: 60, lastTraining: '2024-01-13' },
        { skill: 'Defending', currentLevel: 5, maxLevel: 10, progress: 50, lastTraining: '2024-01-12' },
        { skill: 'Physical', currentLevel: 8, maxLevel: 10, progress: 80, lastTraining: '2024-01-11' },
        { skill: 'Mental', currentLevel: 7, maxLevel: 10, progress: 70, lastTraining: '2024-01-10' }
      ]

      setTrainingSessions(mockSessions)
      setSkillProgress(mockSkills)
    } catch (error) {
      console.error('Error loading training data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startTraining = (sessionId: string) => {
    setTrainingSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, progress: Math.min(session.progress + 25, 100) }
          : session
      )
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical': return <Target className="w-4 h-4" />
      case 'Tactical': return <BookOpen className="w-4 h-4" />
      case 'Physical': return <TrendingUp className="w-4 h-4" />
      case 'Mental': return <Award className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Player Training</h1>
        <p className="text-gray-600">Develop your skills and improve your performance</p>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sessions">Training Sessions</TabsTrigger>
          <TabsTrigger value="progress">Skill Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(session.category)}
                      <Badge variant="outline" className={getDifficultyColor(session.difficulty)}>
                        {session.difficulty}
                      </Badge>
                    </div>
                    <Badge variant={session.completed ? "default" : "secondary"}>
                      {session.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{session.name}</CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration} minutes</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{session.progress}%</span>
                      </div>
                      <Progress value={session.progress} className="h-2" />
                    </div>

                    <Button 
                      onClick={() => startTraining(session.id)}
                      disabled={session.completed}
                      className="w-full"
                    >
                      {session.completed ? 'Completed' : 'Start Training'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillProgress.map((skill) => (
              <Card key={skill.skill}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {skill.skill}
                    <span className="text-sm font-normal text-gray-600">
                      Level {skill.currentLevel}/{skill.maxLevel}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{skill.progress}%</span>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Last trained: {skill.lastTraining}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 