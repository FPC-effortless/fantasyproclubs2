"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useSupabase } from "@/components/providers/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/auth/login-form"
import SignUpForm from "@/components/auth/signup-form"
import { Trophy, Users, Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { session } = useSupabase()

  useEffect(() => {
    if (session) {
      router.push("/")
    }
  }, [session, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-600/3 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                Fantasy Pro Clubs
              </h1>
              <p className="mt-3 text-gray-400 text-lg">
                Manage your club, track stats, and compete in leagues
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="w-full bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-lg border border-gray-700/30 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-green-100">
                Account Access
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose how you want to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/30">
                  <TabsTrigger 
                    value="login"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white text-gray-300 transition-all"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white text-gray-300 transition-all"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register" className="space-y-4">
                  <SignUpForm />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pt-6">
              <div className="text-center space-y-3">
                <Link 
                  href="/help"
                  className="text-sm text-gray-400 hover:text-green-400 transition-colors inline-flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Need help? Contact support
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Footer Links */}
          <div className="text-center space-y-3">
            <Link 
              href="/help"
              className="text-sm text-gray-400 hover:text-green-400 transition-colors inline-flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Need help? Contact support
            </Link>
            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-green-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-green-400 transition-colors">Terms</Link>
              <Link href="/about" className="hover:text-green-400 transition-colors">About</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
