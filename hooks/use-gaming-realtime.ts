import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { RealtimeChannel } from "@supabase/supabase-js"

interface UpgradeRequest {
  id: string
  user_id: string
  requested_role: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

interface GamingTag {
  id: string
  user_id: string
  platform: "xbox" | "playstation"
  tag: string
  status: "available" | "taken" | "pending"
}

interface TeamGamingSession {
  id: string
  team_id: string
  platform: "xbox" | "playstation"
  status: "scheduled" | "in_progress" | "completed"
  start_time: string
  end_time?: string
  participants: string[]
}

export function useGamingRealtime() {
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([])
  const [gamingTags, setGamingTags] = useState<GamingTag[]>([])
  const [teamSessions, setTeamSessions] = useState<TeamGamingSession[]>([])
  const [channels, setChannels] = useState<RealtimeChannel[]>([])

  useEffect(() => {
    // Subscribe to upgrade request changes
    const upgradeChannel = supabase
      .channel("account_upgrade_requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "account_upgrade_requests",
        },
        (payload) => {
          const request = payload.new as UpgradeRequest
          
          if (payload.eventType === "INSERT") {
            setUpgradeRequests((prev) => [...prev, request])
            toast.info("New upgrade request received")
          } else if (payload.eventType === "UPDATE") {
            setUpgradeRequests((prev) =>
              prev.map((r) => (r.id === request.id ? request : r))
            )
            toast.info(`Upgrade request ${request.status}`)
          } else if (payload.eventType === "DELETE") {
            setUpgradeRequests((prev) =>
              prev.filter((r) => r.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // Subscribe to gaming tag changes
    const gamingTagChannel = supabase
      .channel("gaming_tags")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gaming_tags",
        },
        (payload) => {
          const tag = payload.new as GamingTag
          
          if (payload.eventType === "INSERT") {
            setGamingTags((prev) => [...prev, tag])
          } else if (payload.eventType === "UPDATE") {
            setGamingTags((prev) =>
              prev.map((t) => (t.id === tag.id ? tag : t))
            )
            if (tag.status === "taken") {
              toast.error(`Gaming tag ${tag.tag} is no longer available`)
            }
          } else if (payload.eventType === "DELETE") {
            setGamingTags((prev) =>
              prev.filter((t) => t.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // Subscribe to team gaming sessions
    const teamSessionChannel = supabase
      .channel("team_gaming_sessions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_gaming_sessions",
        },
        (payload) => {
          const session = payload.new as TeamGamingSession
          
          if (payload.eventType === "INSERT") {
            setTeamSessions((prev) => [...prev, session])
            toast.info("New gaming session scheduled")
          } else if (payload.eventType === "UPDATE") {
            setTeamSessions((prev) =>
              prev.map((s) => (s.id === session.id ? session : s))
            )
            if (session.status === "in_progress") {
              toast.info("Gaming session started")
            } else if (session.status === "completed") {
              toast.info("Gaming session completed")
            }
          } else if (payload.eventType === "DELETE") {
            setTeamSessions((prev) =>
              prev.filter((s) => s.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    setChannels([upgradeChannel, gamingTagChannel, teamSessionChannel])

    return () => {
      channels.forEach((channel) => channel.unsubscribe())
    }
  }, [])

  const checkGamingTagAvailability = async (
    platform: "xbox" | "playstation",
    tag: string
  ): Promise<boolean> => {
    const { data, error } = await supabase
      .from("gaming_tags")
      .select("id")
      .eq("platform", platform)
      .eq("tag", tag)
      .eq("status", "available")
      .single()

    if (error) {
      console.error("Error checking tag availability:", error)
      return false
    }

    return !data
  }

  const reserveGamingTag = async (
    platform: "xbox" | "playstation",
    tag: string,
    userId: string
  ): Promise<boolean> => {
    const { error } = await supabase.from("gaming_tags").insert({
      platform,
      tag,
      user_id: userId,
      status: "pending",
    })

    if (error) {
      console.error("Error reserving tag:", error)
      return false
    }

    return true
  }

  const createTeamGamingSession = async (
    teamId: string,
    platform: "xbox" | "playstation",
    startTime: string,
    participants: string[]
  ): Promise<boolean> => {
    const { error } = await supabase.from("team_gaming_sessions").insert({
      team_id: teamId,
      platform,
      status: "scheduled",
      start_time: startTime,
      participants,
    })

    if (error) {
      console.error("Error creating gaming session:", error)
      return false
    }

    return true
  }

  return {
    upgradeRequests,
    gamingTags,
    teamSessions,
    checkGamingTagAvailability,
    reserveGamingTag,
    createTeamGamingSession,
  }
} 
