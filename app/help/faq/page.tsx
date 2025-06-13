"use client"

import { LayoutWrapper } from '@/components/layout-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HelpCircle, Search, MessageSquare, Mail, Phone, Book, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const faqData = [
  {
    id: 1,
    category: 'Getting Started',
    question: 'How do I join a club?',
    answer: 'Go to the Teams section, search for a club, and send a join request. Club managers will review and accept or decline your request. You can also apply filters to find clubs that match your playing style and level.',
    popular: true
  },
  {
    id: 2,
    category: 'Transfers',
    question: 'How can I transfer players?',
    answer: 'Visit the Transfer Market, select a player, and make an offer. The current club will review your offer and respond accordingly. You can also set up transfer alerts for specific players or positions.',
    popular: true
  },
  {
    id: 3,
    category: 'Support',
    question: 'How do I report a bug or issue?',
    answer: 'Use the Contact Support page to submit your issue. Our team will get back to you as soon as possible. Include as much detail as possible, including screenshots if relevant.',
    popular: false
  },
  {
    id: 4,
    category: 'Settings',
    question: 'Can I customize my notifications?',
    answer: 'Yes, go to Settings > Notifications to manage your preferences for match updates, transfers, friend requests, and more. You can choose to receive notifications via email, push notifications, or both.',
    popular: true
  },
  {
    id: 5,
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Go to Settings > Account and use the password reset option. You will receive an email with further instructions. Make sure to check your spam folder if you don&apos;t see the email within a few minutes.',
    popular: false
  },
  {
    id: 6,
    category: 'Gameplay',
    question: 'How do match ratings work?',
    answer: 'Match ratings are calculated based on your performance during matches, including goals, assists, passes, defensive actions, and overall team contribution. Higher ratings unlock better rewards and improve your player stats.',
    popular: true
  },
  {
    id: 7,
    category: 'Fantasy',
    question: 'How do I create a fantasy team?',
    answer: 'Go to the Fantasy section and click "Create Team". You&apos;ll have a budget to select players from different positions. Your team earns points based on real match performances of your selected players.',
    popular: false
  },
  {
    id: 8,
    category: 'Social',
    question: 'How do I add friends?',
    answer: 'Use the Friends section to search for players by username or email. You can also send friend requests to players you meet in matches or through club activities.',
    popular: false
  }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))]
  
  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularFAQs = faqData.filter(item => item.popular)

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Getting Started':
        return 'border-green-400/50 text-green-400 bg-green-400/20'
      case 'Transfers':
        return 'border-blue-400/50 text-blue-400 bg-blue-400/20'
      case 'Support':
        return 'border-red-400/50 text-red-400 bg-red-400/20'
      case 'Settings':
        return 'border-purple-400/50 text-purple-400 bg-purple-400/20'
      case 'Account':
        return 'border-yellow-400/50 text-yellow-400 bg-yellow-400/20'
      case 'Gameplay':
        return 'border-cyan-400/50 text-cyan-400 bg-cyan-400/20'
      case 'Fantasy':
        return 'border-orange-400/50 text-orange-400 bg-orange-400/20'
      case 'Social':
        return 'border-pink-400/50 text-pink-400 bg-pink-400/20'
      default:
        return 'border-gray-400/50 text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 via-transparent to-green-800/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        
        {/* Enhanced Header */}
        <div className="relative z-10 bg-gradient-to-r from-green-800 to-green-900 backdrop-blur-lg border-b border-green-700/20 p-6 shadow-xl">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                  FREQUENTLY ASKED QUESTIONS
                </h1>
                <p className="text-green-200/80">Find answers to common questions about Fantasy Pro Clubs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search */}
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                      type="text" 
                      placeholder="Search FAQs..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-green-500/20"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      className={`w-full justify-start text-left ${
                        selectedCategory === category 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
                          : 'text-gray-300 hover:text-green-300 hover:bg-green-600/10'
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="bg-gradient-to-br from-blue-800/20 to-blue-900/20 backdrop-blur-sm border border-blue-700/30 shadow-xl">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-bold text-blue-100 mb-2">Still Need Help?</h3>
                  <p className="text-gray-300 text-sm mb-4">Can&apos;t find what you&apos;re looking for?</p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Popular Questions */}
              {searchTerm === '' && selectedCategory === 'All' && (
                <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-green-100 text-xl flex items-center gap-2">
                      <Book className="w-5 h-5 text-green-400" />
                      Popular Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {popularFAQs.map((faq) => (
                      <div 
                        key={faq.id} 
                        className="p-4 bg-gradient-to-r from-green-600/10 to-green-700/10 rounded-lg border border-green-600/30 cursor-pointer hover:border-green-500/50 transition-all"
                        onClick={() => {
                          setSelectedCategory(faq.category)
                          setSearchTerm(faq.question)
                        }}
                      >
                        <Badge variant="outline" className={getCategoryColor(faq.category) + ' mb-2'}>
                          {faq.category}
                        </Badge>
                        <h4 className="font-medium text-green-100 text-sm hover:text-green-300 transition-colors">
                          {faq.question}
                        </h4>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* FAQ List */}
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 text-xl">
                    {searchTerm ? `Search Results (${filteredFAQs.length})` : 
                     selectedCategory !== 'All' ? `${selectedCategory} Questions` : 'All Questions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq) => (
                      <div 
                        key={faq.id} 
                        className="border border-gray-600/30 rounded-lg bg-gradient-to-r from-gray-700/20 to-gray-800/20 hover:border-green-600/40 transition-all"
                      >
                        <button
                          className="w-full p-4 text-left flex items-center justify-between"
                          onClick={() => toggleExpanded(faq.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className={getCategoryColor(faq.category)}>
                                {faq.category}
                              </Badge>
                              {faq.popular && (
                                <Badge variant="outline" className="border-yellow-400/50 text-yellow-400 bg-yellow-400/20">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-green-100 font-medium hover:text-green-300 transition-colors">
                              {faq.question}
                            </h3>
                          </div>
                          {expandedItems.includes(faq.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {expandedItems.includes(faq.id) && (
                          <div className="px-4 pb-4 border-t border-gray-600/30">
                            <p className="text-gray-300 leading-relaxed pt-4">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <HelpCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">No Results Found</h3>
                      <p className="text-gray-400">Try adjusting your search terms or browse different categories.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Resources */}
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-100 text-lg">Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg border border-green-600/30">
                      <Book className="w-8 h-8 text-green-400 mb-3" />
                      <h4 className="font-semibold text-green-100 mb-2">User Guide</h4>
                      <p className="text-gray-300 text-sm mb-3">Complete guide to using Fantasy Pro Clubs</p>
                      <Button size="sm" variant="outline" className="border-green-600/50 text-green-400 hover:bg-green-600/20">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Guide
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-600/30">
                      <Mail className="w-8 h-8 text-blue-400 mb-3" />
                      <h4 className="font-semibold text-blue-100 mb-2">Email Support</h4>
                      <p className="text-gray-300 text-sm mb-3">Get help via email within 24 hours</p>
                      <Button size="sm" variant="outline" className="border-blue-600/50 text-blue-400 hover:bg-blue-600/20">
                        <Mail className="w-3 h-3 mr-1" />
                        Send Email
                      </Button>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-600/30">
                      <Phone className="w-8 h-8 text-purple-400 mb-3" />
                      <h4 className="font-semibold text-purple-100 mb-2">Live Chat</h4>
                      <p className="text-gray-300 text-sm mb-3">Chat with support agents in real-time</p>
                      <Button size="sm" variant="outline" className="border-purple-600/50 text-purple-400 hover:bg-purple-600/20">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Start Chat
                      </Button>
                    </div>
            </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
} 
