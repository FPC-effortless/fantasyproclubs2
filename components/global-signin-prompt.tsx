"use client"

import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function GlobalSignInPrompt() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [user, loading])

  const handleSignIn = () => {
    router.push("/login")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Sign In Required</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-center">
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            You are not signed in. Some features may be limited until you sign in.
          </p>
          <Button className="w-full" onClick={handleSignIn}>
            Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 