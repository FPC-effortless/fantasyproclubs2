"use client"

import { useState } from "react"
import { TeamMember } from "@/types/team"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gamepad2, Copy, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface TeamMembersListProps {
  members: TeamMember[]
  onMemberClick?: (member: TeamMember) => void
}

export function TeamMembersList({ members, onMemberClick }: TeamMembersListProps) {
  const [sortField, setSortField] = useState<keyof TeamMember>("rating")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [platformFilter, setPlatformFilter] = useState<"all" | "xbox" | "playstation" | "both">("all")
  const [experienceFilter, setExperienceFilter] = useState<"all" | "beginner" | "intermediate" | "advanced" | "professional">("all")

  const handleSort = (field: keyof TeamMember) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const copyGamingTag = (tag: string, platform: string) => {
    navigator.clipboard.writeText(tag)
    toast({
      title: "Copied!",
      description: `${platform} tag copied to clipboard`,
    })
  }

  const filteredMembers = members
    .filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.gaming.xbox_gamertag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.gaming.psn_id?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPlatform = platformFilter === "all" ||
        (platformFilter === "xbox" && member.gaming.preferred_platform === "xbox") ||
        (platformFilter === "playstation" && member.gaming.preferred_platform === "playstation") ||
        (platformFilter === "both" && member.gaming.preferred_platform === "both")

      const matchesExperience = experienceFilter === "all" ||
        member.gaming.experience_level === experienceFilter

      return matchesSearch && matchesPlatform && matchesExperience
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const modifier = sortDirection === "asc" ? 1 : -1

      if (aValue === undefined || bValue === undefined) return 0

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * modifier
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * modifier
      }
      return 0
    })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by name or gaming tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Select value={platformFilter} onValueChange={(value: any) => setPlatformFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="xbox">Xbox</SelectItem>
              <SelectItem value="playstation">PlayStation</SelectItem>
              <SelectItem value="both">Cross-Platform</SelectItem>
            </SelectContent>
          </Select>
          <Select value={experienceFilter} onValueChange={(value: any) => setExperienceFilter(value)}>
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
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("matchesPlayed")}>
                Matches
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("goals")}>
                Goals
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("assists")}>
                Assists
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("rating")}>
                Rating
              </TableHead>
              <TableHead>Gaming Info</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id} className="border-gray-800">
                <TableCell className="text-foreground font-medium">{member.name}</TableCell>
                <TableCell className="text-foreground">{member.position}</TableCell>
                <TableCell className="text-foreground">{member.matchesPlayed}</TableCell>
                <TableCell className="text-foreground">{member.goals}</TableCell>
                <TableCell className="text-foreground">{member.assists}</TableCell>
                <TableCell className="text-foreground">{member.rating}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {member.gaming.xbox_gamertag && (
                      <div className="flex items-center space-x-2">
                        <Gamepad2 className="h-4 w-4 text-green-400" />
                        <span className="text-sm">{member.gaming.xbox_gamertag}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyGamingTag(member.gaming.xbox_gamertag!, "Xbox")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {member.gaming.psn_id && (
                      <div className="flex items-center space-x-2">
                        <Gamepad2 className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">{member.gaming.psn_id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyGamingTag(member.gaming.psn_id!, "PSN")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {member.gaming.experience_level}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      member.status === "active"
                        ? "default"
                        : member.status === "injured"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 