"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MatchManagement } from "@/components/admin/match-management"
import { Calendar, Activity, Trophy, Target } from "lucide-react"
import styles from './matches.module.css'
import { Badge } from "@/components/ui/badge"

export default function MatchesPage() {
  return (
    <div className={styles.container}>
      {/* Background Elements */}
      <div className={styles.backgroundGradient}></div>
      <div className={styles.backgroundCircleTop}></div>
      <div className={styles.backgroundCircleBottom}></div>
      
      {/* Enhanced Header */}
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={styles.headerTitle}>
                MATCH MANAGEMENT
              </h1>
              <p className={styles.headerSubtitle}>Schedule, manage, and track match statistics</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Match Stats Overview */}
        <div className={styles.statsGrid}>
          <Card className={styles.statsCard}>
            <CardContent className={styles.statsCardContent}>
              <div className={styles.statsIconGreen}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className={styles.statsValue}>156</div>
              <div className={styles.statsLabel}>Total Matches</div>
            </CardContent>
          </Card>
          
          <Card className={styles.statsCard}>
            <CardContent className={styles.statsCardContent}>
              <div className={styles.statsIconBlue}>
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className={styles.statsValueBlue}>18</div>
              <div className={styles.statsLabel}>Live Matches</div>
            </CardContent>
          </Card>
          
          <Card className={styles.statsCard}>
            <CardContent className={styles.statsCardContent}>
              <div className={styles.statsIconPurple}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className={styles.statsValuePurple}>24</div>
              <div className={styles.statsLabel}>Scheduled</div>
            </CardContent>
          </Card>
          
          <Card className={styles.statsCard}>
            <CardContent className={styles.statsCardContent}>
              <div className={styles.statsIconOrange}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className={styles.statsValueOrange}>8</div>
              <div className={styles.statsLabel}>Pending Review</div>
            </CardContent>
          </Card>
        </div>

        {/* Match Management Component */}
        <Card className={styles.managementCard}>
          <CardHeader>
            <div className={styles.managementHeader}>
              <div>
                <CardTitle className={styles.managementTitle}>
                  <Calendar className="w-5 h-5 text-green-400" />
                  Match Management Console
                </CardTitle>
                <CardDescription className={styles.managementDescription}>
                  Create, schedule, and manage match events and statistics
                </CardDescription>
              </div>
              <Badge variant="outline" className={styles.managementBadge}>
                Admin Panel
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <MatchManagement />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
