"use client"

import { useState } from "react"
import { Clock, AlertCircle, CheckCircle2, XCircle, Edit, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface UpgradeRequest {
  id: string
  status: "pending" | "approved" | "rejected"
  requestedRole: "player" | "manager"
  submittedAt: string
  estimatedReviewTime?: string
  rejectionReason?: string
  currentStep: number
  totalSteps: number
}

interface UpgradeStatusCardProps {
  request: UpgradeRequest
  onEdit?: () => void
  onViewDetails?: () => void
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-[#00ff87]",
    bgColor: "bg-[#00ff87]/20",
    borderColor: "border-[#00ff87]/30",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30",
  },
}

export function UpgradeStatusCard({ request, onEdit, onViewDetails }: UpgradeStatusCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const StatusIcon = statusConfig[request.status].icon

  const getProgressColor = () => {
    switch (request.status) {
      case "approved":
        return "bg-[#00ff87]"
      case "rejected":
        return "bg-red-400"
      default:
        return "bg-yellow-400"
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <StatusIcon className={`h-5 w-5 ${statusConfig[request.status].color}`} />
            <span>Upgrade Request Status</span>
          </span>
          <Badge className={`${statusConfig[request.status].bgColor} ${statusConfig[request.status].color} ${statusConfig[request.status].borderColor}`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground">{request.currentStep} of {request.totalSteps} steps</span>
          </div>
          <Progress value={(request.currentStep / request.totalSteps) * 100} className={getProgressColor()} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Submitted {formatDistanceToNow(new Date(request.submittedAt), { addSuffix: true })}</span>
          </div>
          {request.estimatedReviewTime && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Estimated review time: {request.estimatedReviewTime}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {request.status === "pending" && (
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10 hover:text-accent-foreground"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Request
            </Button>
          )}
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent-foreground">
                <Info className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Upgrade Request Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Request Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Requested Role:</span>{" "}
                      {request.requestedRole.charAt(0).toUpperCase() + request.requestedRole.slice(1)}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Submitted:</span>{" "}
                      {new Date(request.submittedAt).toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Status:</span>{" "}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </p>
                  </div>
                </div>
                {request.rejectionReason && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Rejection Reason</h4>
                    <p className="text-sm text-red-400">{request.rejectionReason}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Review Process</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Current Step:</span> {request.currentStep} of {request.totalSteps}
                    </p>
                    {request.estimatedReviewTime && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Estimated Completion:</span> {request.estimatedReviewTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
} 
