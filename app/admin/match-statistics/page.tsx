"use client"

import { MatchStatisticsManagement } from "@/components/admin/match-statistics-management"

export default function MatchStatisticsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Match Statistics Management</h1>
      <MatchStatisticsManagement />
    </div>
  )
} 
