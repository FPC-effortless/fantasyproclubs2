import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function SwissNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Competition Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">
        This competition either does not exist or is not a Swiss model competition.
      </p>
      <Button asChild>
        <Link href="/admin/competitions">Return to Competitions</Link>
      </Button>
    </div>
  )
} 