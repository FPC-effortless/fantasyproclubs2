"use client"

import dynamic from "next/dynamic"
import { Loading } from "@/components/loading"

const PlayerAccountManagement = dynamic(
  () => import("@/components/admin/player-account-management").then(mod => ({ default: mod.PlayerAccountManagement })),
  {
    loading: () => <Loading size="lg" />,
    ssr: false
  }
)

export default function PlayersPage() {
  return <PlayerAccountManagement />
} 