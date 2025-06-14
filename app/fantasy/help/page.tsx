"use client"

import { ChevronLeft, Book, Trophy, Users, Target, Zap, Shield } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HelpPage() {
  const rules = [
    {
      title: "Squad Selection",
      icon: Users,
      content: "Select a squad of 15 players consisting of 2 goalkeepers, 5 defenders, 5 midfielders, and 3 forwards.",
    },
    {
      title: "Budget Management", 
      icon: Target,
      content: "Stay within your budget when selecting players. Player values will change based on their performance.",
    },
    {
      title: "Transfers",
      icon: Zap,
      content: "You get 1 free transfer per gameweek. Additional transfers cost 4 points each.",
    },
    {
      title: "Captaincy",
      icon: Shield,
      content: "Your captain's points are doubled. Choose wisely based on fixtures and form.",
    },
    {
      title: "Chips",
      icon: Trophy,
      content: "Use special chips like Triple Captain and Bench Boost strategically throughout the season.",
    },
  ]

  const scoringRules = [
    { action: "Goal scored", points: "+4 pts", color: "text-green-400" },
    { action: "Assist", points: "+3 pts", color: "text-blue-400" },
    { action: "Clean sheet", points: "+4 pts", color: "text-green-400" },
    { action: "Appearance", points: "+2 pts", color: "text-yellow-400" },
    { action: "Yellow card", points: "-1 pt", color: "text-red-400" },
    { action: "Red card", points: "-3 pts", color: "text-red-500" },
    { action: "Own goal", points: "-2 pts", color: "text-red-400" },
    { action: "Penalty miss", points: "-2 pts", color: "text-red-400" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 text-white pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Link href="/fantasy" className="text-white hover:text-green-200 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <Book className="w-6 h-6 text-green-200" />
          <h1 className="text-2xl font-bold">HELP & RULES</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-700/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold text-green-100">Welcome to Fantasy Pro Clubs!</h2>
            </div>
            <p className="text-green-200/80 leading-relaxed">
              Here&apos;s everything you need to know about managing your team and competing with other managers. 
              Master these rules to climb the leaderboards and become the ultimate fantasy manager!
            </p>
          </CardContent>
        </Card>

        {/* Game Rules */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-100 flex items-center gap-2">
            <Book className="w-5 h-5" />
            Game Rules
          </h2>
          {rules.map((rule, index) => (
            <Card key={index} className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-green-500/30 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-green-100">
                  <rule.icon className="w-5 h-5 text-green-400" />
                  {rule.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{rule.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Scoring System */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-100 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Scoring System
          </h2>
          <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="grid gap-3">
                {scoringRules.map((rule, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-gray-200 font-medium">{rule.action}</span>
                    <Badge variant="outline" className={`${rule.color} border-current`}>
                      {rule.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pro Tips */}
        <Card className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-blue-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-100">
              <Zap className="w-5 h-5 text-blue-400" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-blue-200/80">Monitor player form and upcoming fixtures when making transfers</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-blue-200/80">Save your chips for double gameweeks or crucial moments</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-blue-200/80">Balance premium players with budget options to maximize your squad</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
