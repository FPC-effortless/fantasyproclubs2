import { Loader2 } from "lucide-react"

export default function ManagerLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
} 
