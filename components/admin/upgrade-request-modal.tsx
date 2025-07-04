"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, Gamepad2, User, Clock, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import type { Database } from "@/types/database"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface UpgradeRequest {
  id: string
  user_id: string
  username: string
  requested_role: "player" | "manager"
  xbox_gamertag?: string
  psn_id?: string
  preferred_platform: "xbox" | "playstation" | "both"
  experience_level: "beginner" | "intermediate" | "advanced" | "professional"
  status: "pending" | "approved" | "rejected"
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
}

interface UpgradeRequestModalProps {
  request: UpgradeRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestUpdate: () => void
}

export function UpgradeRequestModal({
  request,
  open,
  onOpenChange,
  onRequestUpdate,
}: UpgradeRequestModalProps) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  if (!request) return null

  const handleApprove = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('account_upgrade_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', request.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Request approved successfully",
      })

      onRequestUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error('Error approving request:', error)
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('account_upgrade_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          rejection_reason: rejectionReason.trim(),
        })
        .eq('id', request.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Request rejected successfully",
      })

      onRequestUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyGamingTag = async (platform: 'xbox' | 'playstation', tag: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/verify-gaming-tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          tag
        })
      })

      if (!response.ok) {
        throw new Error('Failed to verify gaming tag')
      }

      const result = await response.json()

      if (result.verified) {
        toast({
          title: "Verification Successful",
          description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} tag "${tag}" is valid and verified.`,
        })
        
        // Update the database to mark this gaming tag as verified
        await updateGamingTagVerification(platform, tag, true)
      } else {
        toast({
          title: "Verification Failed", 
          description: result.error || `Could not verify ${platform} tag "${tag}".`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error('Gaming tag verification error:', error)
      toast({
        title: "Verification Error",
        description: "Failed to verify gaming tag. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateGamingTagVerification = async (platform: 'xbox' | 'playstation', tag: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          platform_verified: verified,
          [`${platform === 'xbox' ? 'xbox_gamertag' : 'psn_id'}_verified`]: verified
        })
        .eq('id', request?.user_id)

      if (error) {
        console.error('Error updating verification status:', error)
      }
    } catch (error) {
      console.error('Error updating gaming tag verification:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-accent" />
            <span>Upgrade Request Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium mb-2">User Information</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Username:</span> {request.username}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Requested Role:</span>{" "}
                    {request.requested_role.charAt(0).toUpperCase() + request.requested_role.slice(1)}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Experience Level:</span>{" "}
                    {request.experience_level.charAt(0).toUpperCase() + request.experience_level.slice(1)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium mb-2">Gaming Information</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Preferred Platform:</span>{" "}
                    {request.preferred_platform.charAt(0).toUpperCase() + request.preferred_platform.slice(1)}
                  </p>
                  {request.xbox_gamertag && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Xbox Gamertag:</span> {request.xbox_gamertag}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent hover:text-accent-foreground hover:bg-accent/10"
                        onClick={() => verifyGamingTag('xbox', request.xbox_gamertag!)}
                      >
                        Verify
                      </Button>
                    </div>
                  )}
                  {request.psn_id && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        <span className="text-muted-foreground">PSN ID:</span> {request.psn_id}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent hover:text-accent-foreground hover:bg-accent/10"
                        onClick={() => verifyGamingTag('playstation', request.psn_id!)}
                      >
                        Verify
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Request Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Submitted {new Date(request.submitted_at).toLocaleString()}</span>
                </div>
                {request.reviewed_at && (
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Reviewed {new Date(request.reviewed_at).toLocaleString()}</span>
                  </div>
                )}
                {request.rejection_reason && (
                  <div className="mt-2 p-2 bg-red-500/10 rounded-md">
                    <p className="text-sm text-red-400">{request.rejection_reason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {request.status === 'pending' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rejection Reason</label>
                <Textarea
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-card border-border"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  className="border-[#00ff87] text-[#00ff87] hover:bg-[#00ff87] hover:text-black"
                  onClick={handleApprove}
                  disabled={isLoading}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Request
                </Button>
                <Button
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                  onClick={handleReject}
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 
