"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Share2, 
  Users, 
  Mail, 
  Copy, 
  Check, 
  Gift, 
  Trophy, 
  Star,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function InvitePage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [invitesSent, setInvitesSent] = useState(0)

  const inviteLink = `${window.location.origin}/register?ref=${Math.random().toString(36).substr(2, 9)}`

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    // Simulate sending invite
    toast({
      title: "Invite Sent!",
      description: `Invitation sent to ${email}`,
    })
    
    setInvitesSent(prev => prev + 1)
    setEmail("")
    setMessage("")
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast({
        title: "Link Copied!",
        description: "Invite link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (platform: string) => {
    const text = `Join me on Fantasy Pro Clubs! The ultimate platform for managing fantasy football teams and competing in leagues. ${inviteLink}`
    
    let url = ""
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
        break
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`
        break
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(text)}`
        break
      default:
        return
    }
    
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="w-full pt-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
            <Share2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-green-100">Invite Friends</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Share the excitement of Fantasy Pro Clubs with your friends and earn rewards for every successful invite!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-400">{invitesSent}</div>
              <div className="text-gray-400 text-sm">Invites Sent</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-400">5</div>
              <div className="text-gray-400 text-sm">Friends Joined</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-900/20 to-gray-900/40 border-purple-800/30">
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-400">250</div>
              <div className="text-gray-400 text-sm">Points Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Form */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Email Invite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-green-100">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-green-100">Personal Message (Optional)</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message to your invite..."
                  className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 resize-none"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Send Invite
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invite Link */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Your Invite Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="bg-gray-800/50 border-gray-700/50 text-white"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              Share this link with friends to invite them to Fantasy Pro Clubs
            </p>
          </CardContent>
        </Card>

        {/* Social Sharing */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-gray-900/40 border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Share on Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => handleShare("twitter")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                onClick={() => handleShare("facebook")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                onClick={() => handleShare("whatsapp")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleShare("instagram")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card className="bg-gradient-to-r from-yellow-900/20 to-gray-900/40 border-yellow-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Invite Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-green-100">For You</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">50 points per successful invite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">Exclusive badges and achievements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">Priority support access</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-green-100">For Your Friends</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">100 bonus points on signup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">Free premium features for 7 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">Exclusive welcome bonus</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-green-100">Invite Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">Share your invite link on social media to reach more friends</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">Add a personal message to make your invite more engaging</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">Invite friends who are passionate about football and gaming</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">Track your invites and rewards in your profile dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 