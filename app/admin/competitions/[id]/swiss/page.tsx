import ClientWrapper from './components/ClientWrapper'

interface PageProps {
  params: {
    id: string
  }
}

export default async function SwissModelPage({ params }: PageProps) {
  return <ClientWrapper competitionId={params.id} />
} 