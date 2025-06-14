"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, Shirt, Users2, BarChart3, HelpCircle } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
    // Simulate loading and fetch user profile/stats
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
    <div className="min-h-screen bg-black text-white pb-8">
      {/* Patterned Header */}
      <div className="relative w-full h-48 rounded-b-3xl overflow-hidden flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #085b2a 60%, #0e4429 100%)' }}>
        <Image src="/pattern.svg" alt="pattern" fill className="object-cover object-center opacity-40" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          <h1 className="text-2xl font-bold tracking-wide text-white mt-4 mb-2 drop-shadow-lg">FANTASY</h1>
          <div className="flex flex-col items-center mt-2">
            <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg">
              <Image src={userProfile.avatar_url} alt="avatar" width={80} height={80} className="object-cover w-full h-full" />
            </div>
            <span className="mt-2 text-lg font-semibold text-white">{userProfile.name}</span>
            <span className="mt-1 px-3 py-1 bg-white/10 text-xs rounded-lg border border-white/20 text-white">Manager</span>
          </div>
        </div>
      </div>

      {/* Gameweek Stats */}
      <div className="mt-6 flex flex-col items-center">
        <span className="text-lg font-semibold">Gameweek {gameweek}</span>
        <div className="w-full flex justify-center mt-2">
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            <div className="flex flex-col items-center justify-center bg-[#14532d] rounded-xl py-3">
              <span className="text-2xl font-bold">{stats.totw}</span>
              <span className="text-xs text-green-200 mt-1">TOTW</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#14532d] rounded-xl py-3">
              <span className="text-2xl font-bold">{stats.points}</span>
              <span className="text-xs text-green-200 mt-1">Points</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-[#14532d] rounded-xl py-3">
              <span className="text-2xl font-bold">{stats.highest}</span>
              <span className="text-xs text-green-200 mt-1">Highest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gameweek & Deadline */}
      <div className="flex justify-between items-center mt-8 px-6">
        <span className="text-base font-semibold">Gameweek {nextGameweek}</span>
        <span className="text-xs text-gray-300 font-semibold">DEADLINE {deadline}</span>
      </div>

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-2 gap-4 mt-4 px-4">
        <Link href="/fantasy/team">
          <Card className="flex flex-col items-center justify-center py-6 bg-[#1a3a24] rounded-xl shadow card-interactive">
            <Shirt className="w-10 h-10 text-green-400 mb-2" />
            <span className="font-semibold text-white">My Team</span>
          </Card>
        </Link>
        <Link href="/fantasy/transfers">
          <Card className="flex flex-col items-center justify-center py-6 bg-[#1a3a24] rounded-xl shadow card-interactive">
            <Users2 className="w-10 h-10 text-green-400 mb-2" />
            <span className="font-semibold text-white">Transfers</span>
          </Card>
        </Link>
        <Link href="/fantasy/statistics">
          <Card className="flex flex-col items-center justify-center py-6 bg-[#1a3a24] rounded-xl shadow card-interactive">
            <BarChart3 className="w-10 h-10 text-green-400 mb-2" />
            <span className="font-semibold text-white">Statistics</span>
          </Card>
        </Link>
        <Link href="/fantasy/help">
          <Card className="flex flex-col items-center justify-center py-6 bg-[#1a3a24] rounded-xl shadow card-interactive">
            <HelpCircle className="w-10 h-10 text-green-400 mb-2" />
            <span className="font-semibold text-white">Help & Rules</span>
          </Card>
        </Link>
      </div>

      {/* League/Club Toggle */}
      <div className="flex justify-center mt-8">
        <button className="bg-green-800 text-white font-semibold px-8 py-2 rounded-full focus:outline-none">League</button>
        <button className="ml-4 bg-transparent text-white font-semibold px-8 py-2 rounded-full border border-green-800 focus:outline-none">Club</button>
      </div>

      {/* Standings Table */}
      <div className="mt-4 px-2">
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
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-6">
        <Button className="w-full max-w-xs bg-green-800 hover:bg-green-700 text-white rounded-xl py-3 text-base font-semibold">View All</Button>
      </div>
    </div>
  )
}
