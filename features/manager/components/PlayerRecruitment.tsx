"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gamepad2, Copy, Star } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Player {
  id: string
  username: string
  gaming: {
    xbox_gamertag?: string
    psn_id?: string
    preferred_platform: "xbox" | "playstation" | "both"
    experience_level: "beginner" | "intermediate" | "advanced" | "professional"
    platform_verified: boolean
  }
  stats: {
    matches_played: number
    win_rate: number
    goals_per_game: number
  }
}

interface PlayerRecruitmentProps {
  teamId: string
  teamGaming: {
    preferred_platform: "xbox" | "playstation" | "both"
    platform_requirements: {
      xbox_required: boolean
      psn_required: boolean
      min_experience: "beginner" | "intermediate" | "advanced" | "professional"
    }
  }
}

export function PlayerRecruitment({ teamId, teamGaming }: PlayerRecruitmentProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [experienceFilter, setExperienceFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("compatibility")

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("user_profiles")
        .select(`
          id,
          username,
          gaming,
          stats
        `)
        .eq("role", "player")
        .eq("team_id", null)

      if (error) throw error
      setPlayers(data || [])
    } catch (error) {
      console.error("Error loading players:", error)
      toast.error("Failed to load available players")
    } finally {
      setLoading(false)
    }
  }

  const calculateCompatibility = (player: Player) => {
    let score = 0

    // Platform compatibility
    if (teamGaming.platform_requirements.xbox_required && player.gaming.xbox_gamertag) score += 2
    if (teamGaming.platform_requirements.psn_required && player.gaming.psn_id) score += 2
    if (player.gaming.preferred_platform === teamGaming.preferred_platform) score += 1

    // Experience level compatibility
    const experienceLevels = ["beginner", "intermediate", "advanced", "professional"]
    const playerLevel = experienceLevels.indexOf(player.gaming.experience_level)
    const requiredLevel = experienceLevels.indexOf(teamGaming.platform_requirements.min_experience)
    if (playerLevel >= requiredLevel) score += 2

    // Platform verification bonus
    if (player.gaming.platform_verified) score += 1

    return score
  }

  const filteredPlayers = players
    .filter(player => {
      const matchesSearch = player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.gaming.xbox_gamertag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.gaming.psn_id?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPlatform = platformFilter === "all" ||
        (platformFilter === "xbox" && player.gaming.xbox_gamertag) ||
        (platformFilter === "playstation" && player.gaming.psn_id) ||
        (platformFilter === "cross-platform" && player.gaming.preferred_platform === "both")

      const matchesExperience = experienceFilter === "all" ||
        player.gaming.experience_level === experienceFilter

      return matchesSearch && matchesPlatform && matchesExperience
    })
    .sort((a, b) => {
      if (sortBy === "compatibility") {
        return calculateCompatibility(b) - calculateCompatibility(a)
      }
      if (sortBy === "experience") {
        const levels = ["beginner", "intermediate", "advanced", "professional"]
        return levels.indexOf(b.gaming.experience_level) - levels.indexOf(a.gaming.experience_level)
      }
      if (sortBy === "stats") {
        return b.stats.win_rate - a.stats.win_rate
      }
      return 0
    })

  const handleInvite = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from("team_invites")
        .insert({
          team_id: teamId,
          player_id: playerId,
          status: "pending"
        })

      if (error) throw error
      toast.success("Invitation sent successfully")
    } catch (error) {
      console.error("Error sending invite:", error)
      toast.error("Failed to send invitation")
    }
  }

  const copyGamingTag = (tag: string) => {
    navigator.clipboard.writeText(tag)
    toast.success("Gaming tag copied to clipboard")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Recruitment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by username or gaming tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="xbox">Xbox Only</SelectItem>
                <SelectItem value="playstation">PlayStation Only</SelectItem>
                <SelectItem value="cross-platform">Cross-Platform</SelectItem>
              </SelectContent>
            </Select>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compatibility">Compatibility</SelectItem>
                <SelectItem value="experience">Experience Level</SelectItem>
                <SelectItem value="stats">Win Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredPlayers.map((player) => (
              <Card key={player.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{player.username}</h3>
                        <Badge variant={player.gaming.platform_verified ? "default" : "secondary"}>
                          {player.gaming.platform_verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant="outline">{player.gaming.experience_level}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {player.gaming.xbox_gamertag && (
                          <div className="flex items-center gap-1">
                            <Gamepad2 className="h-4 w-4" />
                            <span>Xbox: {player.gaming.xbox_gamertag}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4"
                              onClick={() => copyGamingTag(player.gaming.xbox_gamertag!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {player.gaming.psn_id && (
                          <div className="flex items-center gap-1">
                            <Gamepad2 className="h-4 w-4" />
                            <span>PSN: {player.gaming.psn_id}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4"
                              onClick={() => copyGamingTag(player.gaming.psn_id!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">
                            {calculateCompatibility(player)}/6
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {player.stats.matches_played} matches
                        </div>
                      </div>
                      <Button onClick={() => handleInvite(player.id)}>
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 