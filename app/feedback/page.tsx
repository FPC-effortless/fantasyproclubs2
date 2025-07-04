"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

import { 
  MessageCircle, 
  Star, 
  Bug, 
  Lightbulb, 
  Heart, 
  Send,
  CheckCircle,
  AlertCircle,

} from "lucide-react"

const feedbackTypes = [
  { id: "bug", label: "Bug Report", icon: Bug, color: "text-red-400" },
  { id: "feature", label: "Feature Request", icon: Lightbulb, color: "text-blue-400" },
  { id: "general", label: "General Feedback", icon: MessageCircle, color: "text-green-400" },
  { id: "praise", label: "Praise", icon: Heart, color: "text-pink-400" }
]

export default function FeedbackPage() {
  const [type, setType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!type || !title || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simulate submission
    toast({
      title: "Feedback Submitted!",
      description: "Thank you for your feedback. We'll review it and get back to you soon.",
    })
    
    setSubmitted(true)
    // Reset form
    setTimeout(() => {
      setType("")
      setTitle("")
      setDescription("")
      setEmail("")
      setRating(0)
      setSubmitted(false)
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 flex items-center justify-center">
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30 max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-100 mb-2">Thank You!</h2>
            <p className="text-gray-400 mb-6">
              Your feedback has been submitted successfully. We appreciate your input and will review it carefully.
            </p>
            <Button onClick={() => setSubmitted(false)} className="bg-green-600 hover:bg-green-700">
              Submit More Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="w-full pt-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-green-100">Send Feedback</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Help us improve Fantasy Pro Clubs by sharing your thoughts, reporting bugs, or suggesting new features.
          </p>
        </div>

        {/* Feedback Form */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-green-100">Share Your Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div>
                <Label className="text-green-100 mb-3 block">Feedback Type *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {feedbackTypes.map((feedbackType) => (
                    <button
                      key={feedbackType.id}
                      type="button"
                      onClick={() => setType(feedbackType.id)}
                      className={`p-4 rounded-lg border transition-colors ${
                        type === feedbackType.id
                          ? "border-green-500 bg-green-900/30"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <feedbackType.icon className={`w-6 h-6 mx-auto mb-2 ${feedbackType.color}`} />
                      <div className="text-sm font-medium text-green-100">{feedbackType.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-green-100">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of your feedback"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-green-100">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide detailed information about your feedback..."
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 resize-none"
                  rows={6}
                />
              </div>

              {/* Rating */}
              <div>
                <Label className="text-green-100 mb-3 block">How would you rate your overall experience?</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-2 hover:bg-gray-800/50 rounded transition-colors"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? "text-yellow-400 fill-current" : "text-gray-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  {rating === 0 && "Select a rating"}
                  {rating === 1 && "Very Poor"}
                  {rating === 2 && "Poor"}
                  {rating === 3 && "Average"}
                  {rating === 4 && "Good"}
                  {rating === 5 && "Excellent"}
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <Label htmlFor="email" className="text-green-100">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Provide your email if you&apos;d like us to follow up on your feedback
                </p>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Feedback Guidelines */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-green-100">Feedback Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Bug className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-100">Bug Reports</h3>
                  <p className="text-gray-400 text-sm">
                    Include steps to reproduce, expected vs actual behavior, and any error messages.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-100">Feature Requests</h3>
                  <p className="text-gray-400 text-sm">
                    Explain the problem you&apos;re trying to solve and how the feature would help.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-100">General Feedback</h3>
                  <p className="text-gray-400 text-sm">
                    Be constructive and specific. We value all feedback, positive and negative.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Contact */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-green-100">Other Ways to Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                <h3 className="font-semibold text-green-100 mb-2">Urgent Issues</h3>
                <p className="text-gray-400 text-sm mb-3">For critical bugs or account issues</p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </div>
              <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-green-100 mb-2">Live Chat</h3>
                <p className="text-gray-400 text-sm mb-3">Get instant help from our team</p>
                <Button variant="outline" size="sm" className="w-full">
                  Start Chat
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 