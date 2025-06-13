"use client"

import { SettingsManagement } from "@/components/admin/settings-management"

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <SettingsManagement />
    </div>
  )
} 
