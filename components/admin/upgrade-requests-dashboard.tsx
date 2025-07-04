"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Download, Filter, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Database } from "@/types/database"
import { UpgradeRequestModal } from "./upgrade-request-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

export function UpgradeRequestsDashboard() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<UpgradeRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    role: "all",
    platform: "all",
    experience: "all",
    status: "pending",
    search: "",
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadRequests()
    subscribeToUpdates()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, filters])

  const loadRequests = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('account_upgrade_requests')
        .select(`
          *,
          users:user_id (
            username
          )
        `)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      const formattedRequests = data.map(request => ({
        ...request,
        username: request.users.username,
      }))

      setRequests(formattedRequests)
    } catch (error) {
      console.error('Error loading requests:', error)
      toast({
        title: "Error",
        description: "Failed to load upgrade requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('upgrade_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'account_upgrade_requests',
        },
        () => {
          loadRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const filterRequests = () => {
    let filtered = [...requests]

    if (filters.role !== 'all') {
      filtered = filtered.filter(request => request.requested_role === filters.role)
    }

    if (filters.platform !== 'all') {
      filtered = filtered.filter(request => request.preferred_platform === filters.platform)
    }

    if (filters.experience !== 'all') {
      filtered = filtered.filter(request => request.experience_level === filters.experience)
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(request => request.status === filters.status)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(request =>
        request.username.toLowerCase().includes(searchLower) ||
        request.xbox_gamertag?.toLowerCase().includes(searchLower) ||
        request.psn_id?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredRequests(filtered)
  }

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('account_upgrade_requests')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .in('id', selectedIds)

      if (error) throw error

      toast({
        title: "Success",
        description: `Successfully ${action}d ${selectedIds.length} requests`,
      })

      setSelectedIds([])
      loadRequests()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast({
        title: "Error",
        description: `Failed to ${action} requests`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportRequests = () => {
    const csvContent = [
      ['ID', 'Username', 'Role', 'Platform', 'Experience', 'Status', 'Submitted', 'Reviewed'],
      ...filteredRequests.map(request => [
        request.id,
        request.username,
        request.requested_role,
        request.preferred_platform,
        request.experience_level,
        request.status,
        new Date(request.submitted_at).toLocaleString(),
        request.reviewed_at ? new Date(request.reviewed_at).toLocaleString() : '',
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `upgrade-requests-${new Date().toISOString()}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Upgrade Requests</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="border-accent text-accent hover:bg-accent/10 hover:text-accent-foreground"
            onClick={exportRequests}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={filters.role}
                onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select
                value={filters.platform}
                onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="xbox">Xbox</SelectItem>
                  <SelectItem value="playstation">PlayStation</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Experience</label>
              <Select
                value={filters.experience}
                onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
          <span className="text-sm text-accent">
            {selectedIds.length} request{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="border-[#00ff87] text-[#00ff87] hover:bg-[#00ff87] hover:text-black"
              onClick={() => handleBulkAction('approve')}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Selected
            </Button>
            <Button
              variant="outline"
              className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
              onClick={() => handleBulkAction('reject')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Selected
            </Button>
          </div>
        </div>
      )}

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <label className="sr-only">Select all</label>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredRequests.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredRequests.map(r => r.id))
                      } else {
                        setSelectedIds([])
                      }
                    }}
                    className="rounded border-gray-300"
                    aria-label="Select all requests"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <label className="sr-only">Select request</label>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(request.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(prev => [...prev, request.id])
                        } else {
                          setSelectedIds(prev => prev.filter(id => id !== request.id))
                        }
                      }}
                      className="rounded border-gray-300"
                      aria-label={`Select request from ${request.username}`}
                    />
                  </TableCell>
                  <TableCell>{request.username}</TableCell>
                  <TableCell className="capitalize">{request.requested_role}</TableCell>
                  <TableCell className="capitalize">{request.preferred_platform}</TableCell>
                  <TableCell className="capitalize">{request.experience_level}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        request.status === 'approved'
                          ? 'bg-[#00ff87]/20 text-[#00ff87] border-[#00ff87]/30'
                          : request.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(request.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="text-accent hover:text-accent-foreground hover:bg-accent/10"
                      onClick={() => {
                        setSelectedRequest(request)
                        setIsModalOpen(true)
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UpgradeRequestModal
        request={selectedRequest}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onRequestUpdate={loadRequests}
      />
    </div>
  )
} 
