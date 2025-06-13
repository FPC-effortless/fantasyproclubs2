"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MatchManagement } from "@/components/admin/match-management"
import { Badge } from "@/components/ui/badge"
import { Calendar, Activity, Trophy, Target } from "lucide-react"

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      
      {/* Enhanced Header */}
      <div className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                MATCH MANAGEMENT
              </h1>
              <p className="text-green-200/80">Schedule, manage, and track match statistics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Match Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">156</div>
              <div className="text-gray-400 text-sm">Total Matches</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">18</div>
              <div className="text-gray-400 text-sm">Live Matches</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-400 mb-1">24</div>
              <div className="text-gray-400 text-sm">Scheduled</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-400 mb-1">8</div>
              <div className="text-gray-400 text-sm">Pending Review</div>
            </CardContent>
          </Card>
        </div>

        {/* Match Management Component */}
        <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-green-100 text-xl flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-400" />
                  Match Management Console
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  Create, schedule, and manage match events and statistics
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-green-600/50 text-green-400 bg-green-600/20">
                Admin Panel
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <MatchManagement />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
