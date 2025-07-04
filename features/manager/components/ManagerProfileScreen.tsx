"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Edit, Trophy, Users, Calendar } from "lucide-react"
import styles from './ManagerProfileScreen.module.css'
import { TeamMember } from "@/types/team"
import { Fixture } from "@/types/match"
import { Button } from "@/components/ui/button"

interface Team {
  id: string
  name: string
  shortName: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  foundedDate: string
  stats: {
    matches: number
    wins: number
    losses: number
    draws: number
  }
}

interface TeamPerformance {
  matches: number
  wins: number
  losses: number
  draws: number
  performance: {
    labels: string[]
    data: number[]
  }
}

interface ManagerProfileScreenProps {
  team: Team
  teamPerformance: TeamPerformance
  teamMembers?: TeamMember[]
  fixtures?: Fixture[]
  onEditProfile: () => void
  onMemberClick?: (member: TeamMember) => void
  onFixtureClick?: (fixture: Fixture) => void
}

export function ManagerProfileScreen({ team, teamPerformance, teamMembers, fixtures, onEditProfile, onMemberClick, onFixtureClick }: ManagerProfileScreenProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className={styles.profileContainer}>
      <Card>
        <CardContent className="pt-6">
          <div className={styles.profileHeader}>
            {team.logoUrl ? (
              <Avatar className={styles.profileAvatar}>
                <AvatarImage src={team.logoUrl} alt={team.name} />
                <AvatarFallback>{team.shortName}</AvatarFallback>
              </Avatar>
            ) : (
              <div className={styles.teamLogo} style={{ backgroundColor: team.primaryColor, color: team.secondaryColor }}>
                {team.shortName}
              </div>
            )}
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>{team.name}</h1>
              <p className="text-muted-foreground">Founded {new Date(team.foundedDate).getFullYear()}</p>
            </div>
            <Button variant="outline" onClick={onEditProfile}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className={styles.profileStats}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{teamPerformance.matches}</div>
          <div className={styles.statLabel}>Matches</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{teamPerformance.wins}</div>
          <div className={styles.statLabel}>Wins</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{teamPerformance.losses}</div>
          <div className={styles.statLabel}>Losses</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{teamPerformance.draws}</div>
          <div className={styles.statLabel}>Draws</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Trophy className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="squad">
            <Users className="mr-2 h-4 w-4" />
            Squad
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h2 className={styles.sectionTitle}>Performance</h2>
              <div className={styles.performanceChart}>
                {/* Add your chart component here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="squad">
          {/* Add squad content here */}
        </TabsContent>

        <TabsContent value="schedule">
          {/* Add schedule content here */}
        </TabsContent>
      </Tabs>
    </div>
  )
} 