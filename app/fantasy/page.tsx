"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Shirt, Users2, BarChart3, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function FantasyPage() {
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState({ totw: 0, points: 0, highest: 0 })
  const [gameweek, setGameweek] = useState(33)
  const [nextGameweek, setNextGameweek] = useState(34)
  const [deadline, setDeadline] = useState("1D2H30M")
  const [standings, setStandings] = useState([
    { pos: 1, team: "Man United", gw: 43, total: 89 },
    { pos: 2, team: "Man City", gw: 32, total: 78 },
    { pos: 3, team: "Chelsea", gw: 36, total: 75 },
    { pos: 4, team: "Arsenal", gw: 35, total: 73 },
    { pos: 5, team: "Tottenham", gw: 20, total: 72 },
  ])

  useEffect(() => {
    setTimeout(() => {
      setUserProfile({
        name: "Eddysongram",
        avatar_url: "/placeholder-avatar.svg",
        role: "Manager"
      })
      setStats({ totw: 108, points: 5, highest: 258 })
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <Skeleton className="h-32 w-80 rounded-2xl mb-6" />
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-24 w-80 mb-4" />
        <Skeleton className="h-40 w-80 mb-4" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="max-w-3xl mx-auto pt-8 px-4 space-y-8">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-green-100 tracking-tight mb-1">Fantasy</h1>
          <p className="text-gray-400 text-sm">Manage your fantasy team, transfers, and stats</p>
        </div>

        {/* User Card */}
        <Card className="p-6 flex items-center gap-4 bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <Image
            src={userProfile.avatar_url}
            alt="avatar"
            width={56}
            height={56}
            className="rounded-full border"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg truncate">{userProfile.name}</div>
            <div className="text-gray-400 text-sm truncate">{userProfile.role}</div>
          </div>
        </Card>

        {/* Gameweek Stats Card */}
        <Card className="p-4 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-lg font-semibold text-green-100">Gameweek {gameweek}</span>
              <div className="flex gap-4 mt-2">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-green-200">{stats.totw}</span>
                  <span className="text-xs text-green-300 mt-1">TOTW</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-green-200">{stats.points}</span>
                  <span className="text-xs text-green-300 mt-1">Points</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-green-200">{stats.highest}</span>
                  <span className="text-xs text-green-300 mt-1">Highest</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end">
              <span className="text-base font-semibold text-green-100">Gameweek {nextGameweek}</span>
              <span className="text-xs text-gray-300 font-semibold mt-1">DEADLINE {deadline}</span>
            </div>
          </div>
        </Card>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-2 gap-4">
          <SectionNavCard href="/fantasy/team" icon={Shirt} label="My Team" />
          <SectionNavCard href="/fantasy/transfers" icon={Users2} label="Transfers" />
          <SectionNavCard href="/fantasy/statistics" icon={BarChart3} label="Statistics" />
          <SectionNavCard href="/fantasy/help" icon={HelpCircle} label="Help & Rules" />
        </div>

        {/* Standings Card */}
        <Card className="p-0 bg-gradient-to-r from-green-900/20 to-gray-900/40 border-green-800/30">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-lg font-semibold text-green-100">Standings</span>
            <Button variant="ghost" size="sm" className="text-green-400" asChild>
              <Link href="/fantasy/standings">View All</Link>
            </Button>
          </div>
          <div className="bg-green-900 rounded-t-xl flex px-4 py-2 text-green-100 text-xs font-semibold">
            <div className="w-8">Pos</div>
            <div className="flex-1">Team</div>
            <div className="w-12 text-right">GW{gameweek}</div>
            <div className="w-12 text-right">Total</div>
          </div>
          {standings.map((row) => (
            <div key={row.pos} className="flex items-center px-4 py-2 border-b border-green-900 text-white text-sm">
              <div className="w-8">{row.pos}</div>
              <div className="flex-1 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                {row.team}
              </div>
              <div className="w-12 text-right">{row.gw}</div>
              <div className="w-12 text-right">{row.total}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function SectionNavCard({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="group">
      <Card className="flex flex-col items-center justify-center py-6 bg-[#1a3a24] rounded-xl shadow card-interactive group-hover:border-green-500 transition-all">
        <Icon className="w-10 h-10 text-green-400 mb-2 group-hover:text-green-300" />
        <span className="font-semibold text-white group-hover:text-green-200">{label}</span>
        <ChevronRight className="w-4 h-4 text-green-400 mt-2 group-hover:text-green-300" />
      </Card>
    </Link>
  )
}
