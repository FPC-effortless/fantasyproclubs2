"use client"

import { useState, useEffect } from "react"
import type { Database } from "@/types/database"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Trophy,
  FileText,
  TrendingUp,
  Filter,
} from "lucide-react"

interface PendingAction {
  id: string
  type: "upgrade_request" | "team_verification" | "match_dispute" | "content_approval"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  status: "pending" | "in_progress" | "resolved" | "rejected"
  created_at: string
  assigned_to?: string
  metadata?: any
}

interface ActionFilter {
  type: string
  priority: string
  status: string
  assignee: string
}

export function PendingActionsDashboard() {
  const [actions, setActions] = useState<PendingAction[]>([])
  const [filteredActions, setFilteredActions] = useState<PendingAction[]>([])
  const [selectedAction, setSelectedAction] = useState<PendingAction | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<ActionFilter>({
    type: "all",
    priority: "all", 
    status: "pending",
    assignee: "all"
  })
  const [resolution, setResolution] = useState("")
  const [isResolving, setIsResolving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchPendingActions()
  }, [])

  useEffect(() => {
    filterActions()
  }, [actions, filters])

  const fetchPendingActions = async () => {
    try {
      setIsLoading(true)
      
      // Fetch upgrade requests
      const { data, error } = await supabase
        .from('account_upgrade_requests')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })

      if (error) throw error

      const upgradeActions: PendingAction[] = (data || []).map(request => ({
        id: request.id,
        type: "upgrade_request",
        title: "Account Upgrade Request",
        description: `User wants to upgrade to ${request.requested_role}`,
        priority: "high",
        status: "pending",
        created_at: request.submitted_at,
      }))

      setActions(upgradeActions)
    } catch (error: any) {
      console.error('Error fetching pending actions:', error)
      toast({
        title: "Error",
        description: "Failed to load pending actions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterActions = () => {
    let filtered = actions

    if (filters.type !== "all") {
      filtered = filtered.filter(action => action.type === filters.type)
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter(action => action.priority === filters.priority)
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(action => action.status === filters.status)
    }

    setFilteredActions(filtered)
  }

  const handleActionClick = (action: PendingAction) => {
    setSelectedAction(action)
    setIsDialogOpen(true)
    setResolution("")
  }

  const handleResolveAction = async (actionId: string, status: "approved" | "rejected") => {
    try {
      setIsResolving(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const updateData = {
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        ...(status === "rejected" && resolution ? { rejection_reason: resolution } : {})
      }

      const { error } = await supabase
        .from('account_upgrade_requests')
        .update(updateData)
        .eq('id', actionId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Action ${status} successfully`,
      })

      setIsDialogOpen(false)
      fetchPendingActions()
    } catch (error: any) {
      console.error('Error resolving action:', error)
      toast({
        title: "Error",
        description: "Failed to resolve action",
        variant: "destructive",
      })
    } finally {
      setIsResolving(false)
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case "upgrade_request":
        return <TrendingUp className="h-4 w-4 text-yellow-400" />
      case "team_verification":
        return <Shield className="h-4 w-4 text-blue-400" />
      case "match_dispute":
        return <Trophy className="h-4 w-4 text-red-400" />
      case "content_approval":
        return <FileText className="h-4 w-4 text-green-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pending Actions</h1>
          <p className="text-muted-foreground">
            Manage and resolve pending administrative actions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={fetchPendingActions} variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="upgrade_request">Upgrade Requests</SelectItem>
                  <SelectItem value="team_verification">Team Verification</SelectItem>
                  <SelectItem value="match_dispute">Match Disputes</SelectItem>
                  <SelectItem value="content_approval">Content Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={filters.assignee} onValueChange={(value) => setFilters({...filters, assignee: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="me">Assigned to Me</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Actions ({filteredActions.length})</CardTitle>
          <CardDescription>
            Click on any action to review and resolve it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.map((action) => (
                <TableRow
                  key={action.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleActionClick(action)}
                >
                  <TableCell>
                    <div className="flex items-start gap-3">
                      {getActionIcon(action.type)}
                      <div>
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {action.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(action.priority)} variant="outline">
                      {action.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(action.status)} variant="outline">
                      {action.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTimeAgo(action.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction && getActionIcon(selectedAction.type)}
              {selectedAction?.title}
            </DialogTitle>
            <DialogDescription>
              Review and resolve this pending action
            </DialogDescription>
          </DialogHeader>

          {selectedAction && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm capitalize">{selectedAction.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedAction.priority)} variant="outline">
                    {selectedAction.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedAction.status)} variant="outline">
                    {selectedAction.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">{new Date(selectedAction.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm mt-1">{selectedAction.description}</p>
              </div>

              {selectedAction.status === "pending" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resolution">Resolution Notes</Label>
                    <Textarea
                      id="resolution"
                      placeholder="Add any notes about your decision..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isResolving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                      onClick={() => handleResolveAction(selectedAction.id, "rejected")}
                      disabled={isResolving}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="bg-[#00ff87] text-black hover:bg-[#00ff87]/90"
                      onClick={() => handleResolveAction(selectedAction.id, "approved")}
                      disabled={isResolving}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 
