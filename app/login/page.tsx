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
    <div className="min-h-screen flex flex-col justify-center items-center bg-black px-4 pb-24 overflow-x-hidden">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-green-400 mb-6">Sign In</h1>
        <div className="space-y-4">
          <LoginForm />
        </div>
      </div>
    </div>
  )
} 
