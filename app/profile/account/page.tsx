"use client"

import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export default function ManageAccountPage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // TODO: Add logic to update user profile in Supabase
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 flex items-center justify-center py-8">
      <Card className="max-w-md w-full p-8 space-y-6">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Image
            src={user?.user_metadata?.avatar_url || "/placeholder-avatar.svg"}
            alt="avatar"
            width={64}
            height={64}
            className="rounded-full border"
          />
          <div className="font-semibold text-lg">Manage Account</div>
        </div>
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Display Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              disabled
            />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  )
} 