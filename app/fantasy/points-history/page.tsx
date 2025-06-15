"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface PointsHistoryRow {
  id: string
  points: number
  date: string
  // Add other fields as needed
}

export default function PointsHistoryPage() {
  const router = useRouter()
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchPointsHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          // @ts-ignore - window.openSignInModal is injected by the auth provider
          window.openSignInModal?.()
          return
        }

        const { data, error } = await supabase
          .from('points_history')
          .select('*')
          .order('date', { ascending: false })

        if (error) throw error
        setPointsHistory(data || [])
      } catch (error) {
        console.error('Error fetching points history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPointsHistory()
  }, [supabase])

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Points History</h1>
        
        {isLoading ? (
          <div>Loading...</div>
        ) : pointsHistory.length === 0 ? (
          <div>No points history available</div>
        ) : (
          <div className="space-y-4">
            {pointsHistory.map((row: PointsHistoryRow, i: number) => (
              <div
                key={row.id}
                className="flex justify-between items-center p-4 bg-gray-800 rounded-lg"
              >
                <div>
                  <div className="font-medium">{row.date}</div>
                </div>
                <div className="text-green-500 font-bold">+{row.points} pts</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
} 