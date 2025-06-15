'use client'

import Link from 'next/link'
import { Trophy, Target, Users, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Feature {
  type: 'fan' | 'player' | 'manager'
  title: string
  description: string
  icon: React.ElementType
  color: string
  benefits: string[]
  cta: string
}

const features: Feature[] = [
  {
    type: 'fan',
    title: 'Fantasy Football Fan',
    description: 'Create fantasy teams, join leagues, and compete with friends',
    icon: Trophy,
    color: 'from-blue-500 to-blue-600',
    benefits: ['Fantasy Team Management', 'League Competitions', 'Player Tracking', 'Weekly Challenges'],
    cta: 'Start as Fan'
  },
  {
    type: 'player',
    title: 'Pro Club Player',
    description: 'Track your performance, join teams, and showcase your skills',
    icon: Target,
    color: 'from-green-500 to-green-600',
    benefits: ['Performance Analytics', 'Team Membership', 'Career Tracking', 'Match History'],
    cta: 'Join as Player'
  },
  {
    type: 'manager',
    title: 'Team Manager',
    description: 'Lead your squad, manage tactics, and organize competitions',
    icon: Users,
    color: 'from-yellow-500 to-yellow-600',
    benefits: ['Team Management', 'Squad Selection', 'Match Organization', 'Analytics Dashboard'],
    cta: 'Manage Teams'
  }
]

export function FeaturePreviewSection() {
  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black/80 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent mb-4">
            Choose Your Path in Fantasy Pro Clubs
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Whether you&apos;re a fan, player, or manager - there&apos;s a perfect experience waiting for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Card 
                key={feature.type} 
                className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 overflow-hidden group hover:border-green-600/40 hover:transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-green-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.color} mr-2`} />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/login">
                    <Button 
                      className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl group`}
                    >
                      {feature.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 max-w-2xl mx-auto shadow-xl">
            <h3 className="text-lg font-semibold text-green-100 mb-2">Already know what you want?</h3>
            <p className="text-gray-300 mb-4">Jump straight into the action with our streamlined registration</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all"
                >
                  I have an account
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white transition-all duration-300 shadow-lg"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 