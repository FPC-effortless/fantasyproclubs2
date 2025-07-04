"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calendar, 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('player_availability')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setAvailability(data || [])
    } catch (error) {
      console.error('Error fetching availability:', error)
      toast({
        title: "Error",
        description: "Failed to load availability data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvailabilityChange = async (date: string, status: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('player_availability')
        .upsert({
          date,
          status,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({
        title: "Availability Updated",
        description: `Marked as ${status} for ${new Date(date).toLocaleDateString()}`,
      })

      fetchAvailability()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading availability data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="w-full pt-8 px-4 space-y-8">
        {/* Header */}
        <div>
          <Link href="/profile" className="flex items-center gap-2 text-green-400 hover:text-green-300 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-green-100">Availability Management</h1>
          <p className="text-gray-400">Update your availability for upcoming matches and training</p>
        </div>

        {/* Availability Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-400">15</div>
              <div className="text-gray-400 text-sm">Available</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-900/20 to-gray-900/40 border-red-800/30">
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-red-400">3</div>
              <div className="text-gray-400 text-sm">Unavailable</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-900/20 to-gray-900/40 border-yellow-800/30">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-yellow-400">2</div>
              <div className="text-gray-400 text-sm">Pending</div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Schedule */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() + i)
                const dateStr = date.toISOString().split('T')[0]
                const status = availability.find(a => a.date === dateStr)?.status || 'pending'
                
                return (
                  <div key={dateStr} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-100">
                          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${i} days from now`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={
                          status === 'available' ? 'default' : 
                          status === 'unavailable' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {status === 'available' ? 'Available' : 
                         status === 'unavailable' ? 'Unavailable' : 
                         'Pending'}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAvailabilityChange(dateStr, 'available')}
                          size="sm"
                          variant={status === 'available' ? 'default' : 'outline'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleAvailabilityChange(dateStr, 'unavailable')}
                          size="sm"
                          variant={status === 'unavailable' ? 'destructive' : 'outline'}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="bg-gradient-to-r from-orange-900/20 to-gray-900/40 border-orange-800/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <span className="text-orange-100">
                Please update your availability at least 24 hours before matches and training sessions.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 