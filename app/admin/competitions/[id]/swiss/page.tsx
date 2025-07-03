import ClientWrapper from './components/ClientWrapper'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SwissModelPage({ params }: PageProps) {
  const { id } = await params
  return <ClientWrapper competitionId={id} />
} 