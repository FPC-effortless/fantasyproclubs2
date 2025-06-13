"use client"

import { TeamPerformance } from "@/types/team"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"

interface TeamPerformanceStatsProps {
  performance: TeamPerformance
}

export function TeamPerformanceStats({ performance }: TeamPerformanceStatsProps) {
  const totalMatches = performance.wins + performance.draws + performance.losses
  const winPercentage = (performance.wins / totalMatches) * 100
  const drawPercentage = (performance.draws / totalMatches) * 100
  const lossPercentage = (performance.losses / totalMatches) * 100

  const getFormBadge = (result: "W" | "D" | "L") => {
    const colors = {
      W: "bg-green-500/20 text-green-500",
      D: "bg-yellow-500/20 text-yellow-500",
      L: "bg-red-500/20 text-red-500",
    }
    return (
      <Badge variant="secondary" className={colors[result]}>
        {result}
      </Badge>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{winPercentage.toFixed(1)}%</div>
          <Progress value={winPercentage} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Goals Scored</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{performance.goalsFor}</div>
          <p className="text-xs text-muted-foreground">
            {performance.goalsFor / totalMatches} per match
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clean Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{performance.cleanSheets}</div>
          <p className="text-xs text-muted-foreground">
            {((performance.cleanSheets / totalMatches) * 100).toFixed(1)}% of matches
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Form</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-1">
            {performance.form.slice(-5).map((result, index) => (
              <div key={index}>{getFormBadge(result as "W" | "D" | "L")}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performance.performance.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="match" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="goalsFor" fill="#22c55e" name="Goals For" />
                <Bar dataKey="goalsAgainst" fill="#ef4444" name="Goals Against" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 