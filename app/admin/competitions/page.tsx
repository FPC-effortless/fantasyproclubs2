'use client'

import dynamic from 'next/dynamic'

const CompetitionManagement = dynamic(
  () => import('@/components/admin/competition-management'),
  { ssr: false }
)

export default function CompetitionsPage() {
  return <CompetitionManagement />
}
