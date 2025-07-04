"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Gamepad2, Shield, Zap, Heart, Target } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="w-full pt-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-green-100">About Fantasy Pro Clubs</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The ultimate platform for managing fantasy football teams, competing in leagues, 
            and connecting with fellow football enthusiasts.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">
              Fantasy Pro Clubs is dedicated to bringing the excitement of football management 
              to fans worldwide. We provide a comprehensive platform where users can create teams, 
              manage players, participate in competitions, and build a community of passionate 
              football enthusiasts.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-green-100">Key Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-100">Team Management</h3>
                  <p className="text-gray-400 text-sm">Create and manage your fantasy teams with detailed player statistics and performance tracking.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-100">Competitions</h3>
                  <p className="text-gray-400 text-sm">Join leagues and tournaments to compete against other managers and win prizes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Gamepad2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-100">Gaming Integration</h3>
                  <p className="text-gray-400 text-sm">Connect your gaming accounts and sync your real gaming performance with fantasy stats.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-100">Real-time Updates</h3>
                  <p className="text-gray-400 text-sm">Get live match updates, player performance data, and instant notifications.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-100">Secure Platform</h3>
                  <p className="text-gray-400 text-sm">Your data is protected with enterprise-grade security and privacy controls.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-100">Community</h3>
                  <p className="text-gray-400 text-sm">Connect with fellow football fans, share strategies, and build lasting friendships.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">10K+</div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">500+</div>
                <div className="text-gray-400 text-sm">Teams Created</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">50+</div>
                <div className="text-gray-400 text-sm">Active Competitions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">24/7</div>
                <div className="text-gray-400 text-sm">Support Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-green-100">Our Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-6">
              Fantasy Pro Clubs is built by a passionate team of football enthusiasts, 
              developers, and designers who share a common goal: creating the best 
              fantasy football experience possible.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-semibold text-green-100">Development Team</h3>
                <p className="text-gray-400 text-sm">Building the platform with cutting-edge technology</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gamepad2 className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="font-semibold text-green-100">Gaming Experts</h3>
                <p className="text-gray-400 text-sm">Ensuring authentic gaming integration</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-green-100">Community Team</h3>
                <p className="text-gray-400 text-sm">Fostering a vibrant and engaged community</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/help">
            <Button variant="outline" className="w-full sm:w-auto">
              Get Help
            </Button>
          </Link>
          <Link href="/help/contact">
            <Button variant="outline" className="w-full sm:w-auto">
              Contact Us
            </Button>
          </Link>
          <Link href="/privacy">
            <Button variant="outline" className="w-full sm:w-auto">
              Privacy Policy
            </Button>
          </Link>
        </div>

        {/* Version Info */}
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            Version 1.0.0
          </Badge>
        </div>
      </div>
    </div>
  )
} 