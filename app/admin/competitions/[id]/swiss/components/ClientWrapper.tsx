'use client'

import dynamic from 'next/dynamic'

const SwissModelContent = dynamic(() => import('./SwissModelContent'), {
  ssr: false
})

export default function ClientWrapper({ competitionId }: { competitionId: string }) {
  return <SwissModelContent competitionId={competitionId} />
} 