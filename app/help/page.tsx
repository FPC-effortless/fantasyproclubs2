"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  HelpCircle, 
  MessageCircle, 
  BookOpen, 
  Users, 
  Trophy, 
  Gamepad2, 
  Settings, 
  Shield,
  ChevronRight,
  Search,
  Mail,
  Phone,
  Clock
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const faqData = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I create an account?",
        answer: "Click the 'Sign Up' button on the homepage, enter your email and password, then verify your email address to get started."
      },
      {
        question: "How do I join a team?",
        answer: "After creating an account, you can either create your own team or join an existing team through the team selection process."
      },
      {
        question: "What gaming platforms are supported?",
        answer: "We currently support Xbox and PlayStation integration. You can connect your gaming accounts in your profile settings."
      }
    ]
  },
  {
    category: "Team Management",
    questions: [
      {
        question: "How do I manage my team?",
        answer: "Use the team management section to view your squad, make transfers, and adjust your lineup for upcoming matches."
      },
      {
        question: "How do player transfers work?",
        answer: "You can buy, sell, or loan players through the transfer market. Each transaction requires approval and may have associated costs."
      },
      {
        question: "What are the team size limits?",
        answer: "Teams can have up to 25 players in their squad, with 11 players in the starting lineup for matches."
      }
    ]
  },
  {
    category: "Competitions",
    questions: [
      {
        question: "How do I join a competition?",
        answer: "Browse available competitions in the competitions section and click 'Join' to register your team."
      },
      {
        question: "How are points calculated?",
        answer: "Points are based on real gaming performance, match results, and player statistics from your connected gaming accounts."
      },
      {
        question: "What are the prize pools?",
        answer: "Prize pools vary by competition. Check individual competition details for specific prize information."
      }
    ]
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "I can't connect my gaming account",
        answer: "Ensure your gaming account is public and verify your credentials. Contact support if issues persist."
      },
      {
        question: "The app is not loading properly",
        answer: "Try refreshing the page, clearing your browser cache, or updating to the latest version of your browser."
      },
      {
        question: "I forgot my password",
        answer: "Use the 'Forgot Password' link on the login page to reset your password via email."
      }
    ]
  }
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="w-full pt-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
            <HelpCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-green-100">Help & Support</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions, get help with your account, and learn how to make the most of Fantasy Pro Clubs.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/help/contact">
            <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30 hover:border-green-600/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-green-100 mb-2">Contact Support</h3>
                <p className="text-gray-400 text-sm">Get in touch with our support team</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/help/faq">
            <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30 hover:border-blue-600/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-green-100 mb-2">FAQ</h3>
                <p className="text-gray-400 text-sm">Frequently asked questions</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/help/rules">
            <Card className="bg-gradient-to-r from-purple-900/20 to-gray-900/40 border-purple-800/30 hover:border-purple-600/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-green-100 mb-2">Rules & Guidelines</h3>
                <p className="text-gray-400 text-sm">Platform rules and community guidelines</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/settings">
            <Card className="bg-gradient-to-r from-orange-900/20 to-gray-900/40 border-orange-800/30 hover:border-orange-600/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Settings className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <h3 className="font-semibold text-green-100 mb-2">Settings</h3>
                <p className="text-gray-400 text-sm">Manage your account settings</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* FAQ Section */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-green-100">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {filteredFAQ.map((category) => (
              <div key={category.category} className="space-y-3">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
                  className="flex items-center justify-between w-full p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <h3 className="font-semibold text-green-100">{category.category}</h3>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategory === category.category ? 'rotate-90' : ''}`} />
                </button>
                {expandedCategory === category.category && (
                  <div className="space-y-3 pl-4">
                    {category.questions.map((item, index) => (
                      <div key={index} className="bg-gray-800/30 rounded-lg p-4">
                        <h4 className="font-semibold text-green-100 mb-2">{item.question}</h4>
                        <p className="text-gray-300 text-sm">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Still Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Mail className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-green-100 mb-2">Email Support</h3>
                <p className="text-gray-400 text-sm mb-3">support@fantasyproclubs.com</p>
                <Badge variant="secondary">Response within 24h</Badge>
              </div>
              <div className="text-center">
                <Phone className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-green-100 mb-2">Live Chat</h3>
                <p className="text-gray-400 text-sm mb-3">Available during business hours</p>
                <Badge variant="secondary">Mon-Fri 9AM-6PM</Badge>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-green-100 mb-2">Community</h3>
                <p className="text-gray-400 text-sm mb-3">Get help from other users</p>
                <Badge variant="secondary">24/7 Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-green-100">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Link href="/teams" className="block text-green-400 hover:text-green-300 text-sm">→ Team Management Guide</Link>
                <Link href="/competitions" className="block text-green-400 hover:text-green-300 text-sm">→ Competition Rules</Link>
                <Link href="/fantasy" className="block text-green-400 hover:text-green-300 text-sm">→ Fantasy League Guide</Link>
              </div>
              <div className="space-y-2">
                <Link href="/profile/account" className="block text-green-400 hover:text-green-300 text-sm">→ Account Settings</Link>
                <Link href="/privacy" className="block text-green-400 hover:text-green-300 text-sm">→ Privacy Policy</Link>
                <Link href="/about" className="block text-green-400 hover:text-green-300 text-sm">→ About Us</Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/help/contact">
            <Button className="bg-green-600 hover:bg-green-700">
              Contact Support
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline">
              About Us
            </Button>
          </Link>
          <Link href="/privacy">
            <Button variant="outline">
              Privacy Policy
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 