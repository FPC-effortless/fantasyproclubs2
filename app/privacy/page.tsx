"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, Database, Users, Bell, Globe, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="w-full pt-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-green-100">Privacy Policy</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <Badge variant="secondary" className="text-xs">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Information We Collect */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-100 mb-2">Account Information</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Email address and password</li>
                  <li>• Display name and profile picture</li>
                  <li>• Gaming platform credentials</li>
                  <li>• User preferences and settings</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-green-100 mb-2">Usage Data</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Team management activities</li>
                  <li>• Competition participation</li>
                  <li>• Gaming performance statistics</li>
                  <li>• App usage patterns</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-100">Account Management</h4>
                    <p className="text-gray-400 text-sm">To create and manage your account, provide customer support, and personalize your experience.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-100">Notifications</h4>
                    <p className="text-gray-400 text-sm">To send you important updates about matches, competitions, and account activities.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-100">Service Improvement</h4>
                    <p className="text-gray-400 text-sm">To analyze usage patterns and improve our platform features and performance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-100">Competitions</h4>
                    <p className="text-gray-400 text-sm">To manage competitions, calculate rankings, and distribute prizes.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-gray-900/40 border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Data Protection & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-100 mb-2">Security Measures</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• End-to-end encryption for sensitive data</li>
                  <li>• Secure authentication protocols</li>
                  <li>• Regular security audits</li>
                  <li>• GDPR compliance measures</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-green-100 mb-2">Data Retention</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Account data: Until account deletion</li>
                  <li>• Usage logs: 12 months</li>
                  <li>• Competition data: 5 years</li>
                  <li>• Analytics: 2 years (anonymized)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-green-100">Data Sharing & Third Parties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share data only in the following circumstances:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-green-100">Service Providers</h4>
                  <p className="text-gray-400 text-sm">Trusted partners who help us operate our platform (hosting, analytics, payment processing).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-green-100">Legal Requirements</h4>
                  <p className="text-gray-400 text-sm">When required by law or to protect our rights and safety.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-green-100">Gaming Platforms</h4>
                  <p className="text-gray-400 text-sm">With your consent, to sync gaming performance data.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="bg-gradient-to-r from-orange-900/20 to-gray-900/40 border-orange-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Your Privacy Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-green-100">Access & Control</h4>
                  <p className="text-gray-400 text-sm">View, update, or delete your personal information at any time through your account settings.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-100">Data Portability</h4>
                  <p className="text-gray-400 text-sm">Request a copy of your data in a machine-readable format.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-green-100">Opt-out Options</h4>
                  <p className="text-gray-400 text-sm">Unsubscribe from marketing communications and control notification preferences.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-green-100">Account Deletion</h4>
                  <p className="text-gray-400 text-sm">Permanently delete your account and all associated data.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-green-100">Cookies & Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-green-100 text-sm">Essential Cookies</h4>
                <p className="text-gray-400 text-xs">Required for basic functionality and security.</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-100 text-sm">Analytics Cookies</h4>
                <p className="text-gray-400 text-xs">Help us understand how you use our platform.</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-100 text-sm">Preference Cookies</h4>
                <p className="text-gray-400 text-xs">Remember your settings and preferences.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p>📧 Email: privacy@fantasyproclubs.com</p>
              <p>📞 Support: support@fantasyproclubs.com</p>
              <p>🌐 Website: fantasyproclubs.com</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/help">
            <Button variant="outline" className="w-full sm:w-auto">
              Help & Support
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" className="w-full sm:w-auto">
              About Us
            </Button>
          </Link>
          <Link href="/help/contact">
            <Button variant="outline" className="w-full sm:w-auto">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 