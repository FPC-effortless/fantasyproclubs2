"use client"

import { useEffect, useState } from "react"
import { Users, CheckCircle2, XCircle, Gamepad2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/types/database"
import { createClient } from "@/lib/supabase/client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Statistics {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  approvalRate: number
  platformDistribution: {
    xbox: number
    playstation: number
    both: number
  }
  experienceDistribution: {
    beginner: number
    intermediate: number
    advanced: number
    professional: number
  }
  roleDistribution: {
    player: number
    manager: number
  }
}

const COLORS = ['#00ff87', '#ff4d4d', '#ffd700']

export function UpgradeStatistics() {
  const [statistics, setStatistics] = useState<Statistics>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    approvalRate: 0,
    platformDistribution: {
      xbox: 0,
      playstation: 0,
      both: 0,
    },
    experienceDistribution: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      professional: 0,
    },
    roleDistribution: {
      player: 0,
      manager: 0,
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStatistics()
    subscribeToUpdates()
  }, [])

  const loadStatistics = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('account_upgrade_requests')
        .select('*')

      if (error) throw error

      const stats: Statistics = {
        totalRequests: data.length,
        pendingRequests: data.filter(r => r.status === 'pending').length,
        approvedRequests: data.filter(r => r.status === 'approved').length,
        rejectedRequests: data.filter(r => r.status === 'rejected').length,
        approvalRate: data.filter(r => r.status === 'approved').length / data.length * 100,
        platformDistribution: {
          xbox: data.filter(r => r.preferred_platform === 'xbox').length,
          playstation: data.filter(r => r.preferred_platform === 'playstation').length,
          both: data.filter(r => r.preferred_platform === 'both').length,
        },
        experienceDistribution: {
          beginner: data.filter(r => r.experience_level === 'beginner').length,
          intermediate: data.filter(r => r.experience_level === 'intermediate').length,
          advanced: data.filter(r => r.experience_level === 'advanced').length,
          professional: data.filter(r => r.experience_level === 'professional').length,
        },
        roleDistribution: {
          player: data.filter(r => r.requested_role === 'player').length,
          manager: data.filter(r => r.requested_role === 'manager').length,
        },
      }

      setStatistics(stats)
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('upgrade_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'account_upgrade_requests',
        },
        () => {
          loadStatistics()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const platformData = [
    { name: 'Xbox', value: statistics.platformDistribution.xbox },
    { name: 'PlayStation', value: statistics.platformDistribution.playstation },
    { name: 'Both', value: statistics.platformDistribution.both },
  ]

  const experienceData = [
    { name: 'Beginner', value: statistics.experienceDistribution.beginner },
    { name: 'Intermediate', value: statistics.experienceDistribution.intermediate },
    { name: 'Advanced', value: statistics.experienceDistribution.advanced },
    { name: 'Professional', value: statistics.experienceDistribution.professional },
  ]

  const roleData = [
    { name: 'Player', value: statistics.roleDistribution.player },
    { name: 'Manager', value: statistics.roleDistribution.manager },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalRequests}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[#00ff87]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.approvalRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.rejectedRequests}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gamepad2 className="h-5 w-5 text-accent" />
              <span>Platform Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-accent" />
              <span>Experience Level Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={experienceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00ff87" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-accent" />
            <span>Role Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#00ff87" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
