"use client"

import { UpgradeRequestsDashboard } from "@/components/admin/upgrade-requests-dashboard"
import { UpgradeStatistics } from "@/components/admin/upgrade-statistics"

export default function AdminUpgradesPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Upgrade Requests</h1>
      </div>
      <UpgradeStatistics />
      <UpgradeRequestsDashboard />
    </div>
  )
} 
