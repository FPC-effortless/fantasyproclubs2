"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"
import { createClient } from '@/lib/supabase/client'

const ONBOARDING_KEY = "onboarding_complete"

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)
  const [teams, setTeams] = useState<{ id: string, name: string, crest_url?: string }[]>([])
  const [favoriteTeam, setFavoriteTeam] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient();
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done) setOpen(true)
    const fetchTeams = async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, crest_url')
        .order('name')
      if (!error && data) {
        setTeams(data)
      }
    }
    fetchTeams()
  }, [])

  const handleFinish = () => {
    localStorage.setItem(ONBOARDING_KEY, "1")
    if (favoriteTeam) {
      localStorage.setItem("favorite_team", favoriteTeam)
    }
    setOpen(false)
    router.refresh()
  }

  const handleNotifPermission = async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission()
    }
    setStep(step + 1)
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg w-full p-0 bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex flex-col items-center justify-center p-8">
            <Image src="/logo.png" alt="App Logo" width={80} height={80} className="mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Fantasy Pro Clubs!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Personalize your experience in a few quick steps.</p>
            <Button onClick={() => setStep(1)} className="w-full">Get Started</Button>
          </div>
        )}
        {/* Step 1: (Optional) Sign In */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-2">Sign In or Continue as Guest</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Sign in to sync your fantasy team and settings across devices. You can skip for now.</p>
            <div className="flex flex-col gap-3 w-full">
              <Button onClick={() => { setOpen(false); router.push("/login") }} className="w-full">Sign In</Button>
              <Button variant="outline" onClick={() => setStep(2)} className="w-full">Continue as Guest</Button>
            </div>
          </div>
        )}
        {/* Step 2: Select Favorite Team */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-4">Select Your Favorite Team</h2>
            <div className="grid grid-cols-3 gap-4 mb-6 max-h-72 overflow-y-auto">
              {teams.map(team => (
                <button
                  key={team.id}
                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${favoriteTeam === team.id ? 'border-green-600 bg-green-50 dark:bg-green-900' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => setFavoriteTeam(team.id)}
                >
                  {team.crest_url ? (
                    <Image src={team.crest_url} alt={team.name} width={48} height={48} />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-500">No Crest</div>
                  )}
                  <span className="mt-2 text-sm font-medium">{team.name}</span>
                </button>
              ))}
            </div>
            <Button onClick={() => setStep(3)} className="w-full" disabled={!favoriteTeam}>Next</Button>
          </div>
        )}
        {/* Step 3: Notification Permission */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold mb-2">Stay Updated!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Enable notifications for match updates, goals, and news about your favorite team.</p>
            <Button onClick={handleNotifPermission} className="w-full mb-2">Enable Notifications</Button>
            <Button variant="outline" onClick={() => setStep(4)} className="w-full">Skip</Button>
          </div>
        )}
        {/* Step 4: Finish */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-bold mb-2">You&apos;re All Set!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Enjoy a personalized experience. You can change your favorite team anytime in your profile.</p>
            <Button onClick={handleFinish} className="w-full">Go to App</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 