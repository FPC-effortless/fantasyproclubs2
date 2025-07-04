"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGamingRealtime } from "@/hooks/use-gaming-realtime"
import { format } from "date-fns"
import { Gamepad2, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TeamGamingSessionsProps {
  teamId: string
  teamMembers: Array<{
    id: string
    name: string
    gaming: {
      preferred_platform: "xbox" | "playstation" | "both"
    }
  }>
}

export function TeamGamingSessions({ teamId, teamMembers }: TeamGamingSessionsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<"xbox" | "playstation">("xbox")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const { teamSessions, createTeamGamingSession } = useGamingRealtime()

  const handleCreateSession = async () => {
    if (!selectedDate || !selectedTime || selectedMembers.length === 0) {
      return
    }

    const startTime = new Date(`${selectedDate}T${selectedTime}`).toISOString()
    const success = await createTeamGamingSession(
      teamId,
      selectedPlatform,
      startTime,
      selectedMembers
    )

    if (success) {
      setSelectedDate("")
      setSelectedTime("")
      setSelectedMembers([])
    }
  }

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500"
      case "in_progress":
        return "bg-green-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatSessionTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Gaming Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Create Session Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={selectedPlatform}
                  onValueChange={(value: "xbox" | "playstation") =>
                    setSelectedPlatform(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xbox">Xbox</SelectItem>
                    <SelectItem value="playstation">PlayStation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Participants</Label>
                <Select
                  value={selectedMembers.join(",")}
                  onValueChange={(value) => setSelectedMembers(value.split(","))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team members" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers
                      .filter(
                        (member) =>
                          member.gaming.preferred_platform === selectedPlatform ||
                          member.gaming.preferred_platform === "both"
                      )
                      .map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreateSession}>Create Session</Button>
          </div>

          {/* Active Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Sessions</h3>
            {teamSessions
              .filter((session) => session.status !== "completed")
              .map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4" />
                          <span className="font-medium">
                            {session.platform.charAt(0).toUpperCase() +
                              session.platform.slice(1)}
                          </span>
                          <Badge
                            className={getSessionStatusColor(session.status)}
                          >
                            {session.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatSessionTime(session.start_time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{session.participants.length} players</span>
                          </div>
                        </div>
                      </div>
                      {session.status === "scheduled" && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Handle join session
                          }}
                        >
                          Join Session
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Past Sessions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Past Sessions</h3>
            {teamSessions
              .filter((session) => session.status === "completed")
              .map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4" />
                          <span className="font-medium">
                            {session.platform.charAt(0).toUpperCase() +
                              session.platform.slice(1)}
                          </span>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatSessionTime(session.start_time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{session.participants.length} players</span>
                          </div>
                        </div>
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
