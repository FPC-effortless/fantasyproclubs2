'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Gamepad2, Trophy, Info } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

export default function GamingSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [xboxGamertag, setXboxGamertag] = useState('')
  const [psnId, setPsnId] = useState('')
  const [preferredPlatform, setPreferredPlatform] = useState<'xbox' | 'playstation'>('xbox')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkSignupFlow()
  }, [])

  const checkSignupFlow = async () => {
    const tempUserId = searchParams.get('userId')
    const role = searchParams.get('role')
    
    if (!tempUserId || !role || (role !== 'player' && role !== 'manager')) {
      toast({
        title: "Invalid Access",
        description: "Please complete the previous steps first.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    // Attempt session verification but allow flow without it
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id !== tempUserId) {
        console.warn('Session mismatch, proceeding')
      }
    } catch (err) {
      console.warn('No active session in gaming setup')
    }
  }

  const validateGamertag = (tag: string): boolean => {
    return tag.length >= 3 && tag.length <= 12
  }

  const validatePsnId = (id: string): boolean => {
    return id.length >= 3 && id.length <= 16
  }

  const handleSubmit = async () => {
    // Validate that at least one gaming ID is provided
    if (!xboxGamertag && !psnId) {
      toast({
        title: "Gaming ID Required",
        description: "Please provide at least one gaming ID (Xbox or PlayStation).",
        variant: "destructive",
      })
      return
    }

    // Validate Xbox gamertag if provided
    if (xboxGamertag && !validateGamertag(xboxGamertag)) {
      toast({
        title: "Invalid Xbox Gamertag",
        description: "Xbox gamertag must be between 3 and 12 characters.",
        variant: "destructive",
      })
      return
    }

    // Validate PSN ID if provided
    if (psnId && !validatePsnId(psnId)) {
      toast({
        title: "Invalid PSN ID",
        description: "PSN ID must be between 3 and 16 characters.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const userId = searchParams.get('userId')

    try {
      // Upsert user profile gaming IDs
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          xbox_gamertag: xboxGamertag || null,
          psn_id: psnId || null,
          preferred_platform: preferredPlatform
        }, { onConflict: 'user_id' })

      if (error) {
        console.warn('Upsert gaming IDs error:', error)
      }

      // Complete the signup process
      toast({
        title: "Welcome to Fantasy Pro Clubs!",
        description: "Your account has been created successfully.",
      })
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error updating gaming IDs:', error)
      toast({
        title: "Error",
        description: "Failed to save your gaming information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                Gaming Setup
              </h1>
              <p className="mt-3 text-gray-400 text-lg">
                Add your gaming IDs to connect with other players
              </p>
            </div>
          </div>

          {/* Gaming IDs Form */}
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-lg border-gray-700/30">
            <div className="p-8 space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-blue-400 mb-1">Required for Players & Managers</p>
                  <p>You must provide at least one gaming ID to participate in matches. You can add both if you play on multiple platforms.</p>
                </div>
              </div>

              {/* Xbox Gamertag */}
              <div className="space-y-2">
                <Label htmlFor="xbox" className="text-green-100">
                  Xbox Gamertag
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912C23.002 17.48 24 14.861 24 12.004c0-3.34-1.365-6.362-3.57-8.536 0 0-.027-.022-.082-.042-.063-.022-.152-.045-.281-.045-.592 0-1.985.434-4.805 3.246zM3.654 3.426c-.057.02-.082.041-.086.042C1.365 5.642 0 8.664 0 12.004c0 2.854.998 5.473 2.661 7.533-1.401-2.605 3.579-9.951 6.08-12.91-2.82-2.813-4.216-3.245-4.806-3.245-.131 0-.218.023-.281.046v-.002zM12 3.551S9.055 1.828 6.755 1.746c-.903-.033-1.454.295-1.521.339C7.379.646 9.659 0 11.984 0H12c2.334 0 4.605.646 6.766 2.085-.068-.046-.615-.372-1.52-.339C14.946 1.828 12 3.545 12 3.545v.006z"/>
                    </svg>
                  </div>
                  <Input
                    id="xbox"
                    type="text"
                    placeholder="Enter your Xbox gamertag (3-12 characters)"
                    value={xboxGamertag}
                    onChange={(e) => setXboxGamertag(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                  />
                </div>
                <p className="text-xs text-gray-400">3-12 characters, as shown on your Xbox profile</p>
              </div>

              {/* PSN ID */}
              <div className="space-y-2">
                <Label htmlFor="psn" className="text-green-100">
                  PlayStation Network ID
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.445 17.007l-4.97-1.994c-.577-.228-1.05-.44-1.05-.896 0-.523.578-.713 1.02-.713.443 0 1.02.23 1.02.23l3.98 1.487v-2.71l-.23-.08s-1.43-.532-3.32-.532c-1.87 0-3.9.77-3.9 3.26 0 .65.17 1.25.5 1.76.33.52.83.94 1.46 1.26l5.49 2.19v-3.19zm3.24-9.005v7.04c0 .58-.08.96-.24 1.14-.16.19-.45.28-.86.28-.42 0-.98-.13-1.61-.36v2.71c.63.17 1.24.27 1.86.27 1.27 0 2.26-.3 2.95-.9.69-.6 1.04-1.52 1.04-2.77V8.002h-3.14zM20.494 14.381c-.578-.116-1.08-.116-1.511-.116-.578 0-1.194.116-1.733.347v2.98s1.279.58 2.496.58c.462 0 .925-.116 1.271-.347.347-.231.578-.579.694-.926.115-.346.115-.693.115-1.04v-5.82h-3.13v5.128c0 .462 0 .81.116 1.04.115.232.346.347.693.347.346 0 .693-.115.925-.347.115-.115.115-.346.115-.693V9.966h2.38v4.415h-.431z"/>
                    </svg>
                  </div>
                  <Input
                    id="psn"
                    type="text"
                    placeholder="Enter your PSN ID (3-16 characters)"
                    value={psnId}
                    onChange={(e) => setPsnId(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-green-500"
                  />
                </div>
                <p className="text-xs text-gray-400">3-16 characters, as shown on your PlayStation profile</p>
              </div>

              {/* Preferred Platform */}
              <div className="space-y-2">
                <Label className="text-green-100">
                  Preferred Platform
                </Label>
                <RadioGroup value={preferredPlatform} onValueChange={(value: 'xbox' | 'playstation') => setPreferredPlatform(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="xbox" id="platform-xbox" className="border-gray-600 text-green-500" />
                    <Label htmlFor="platform-xbox" className="text-gray-300 cursor-pointer">Xbox</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="playstation" id="platform-ps" className="border-gray-600 text-green-500" />
                    <Label htmlFor="platform-ps" className="text-gray-300 cursor-pointer">PlayStation</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-gray-400">Select your main gaming platform</p>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!xboxGamertag && !psnId)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Complete Signup'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 