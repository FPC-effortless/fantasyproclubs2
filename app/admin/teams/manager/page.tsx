'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast, toast } from "@/components/ui/use-toast"
import { AdminLayout } from '@/components/admin/layout'
import { createClient } from "@/lib/supabase/client"

export default function TeamManagerPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      // Fetch teams with their current managers
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          short_name,
          manager_id,
          managers:users!teams_manager_id_fkey (
            id,
            email,
            user_metadata
          )
        `)
        .order('name')

      if (teamsError) throw teamsError

      // Fetch all users who could be managers
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, user_metadata')
        .order('email')

      if (usersError) throw usersError

      setTeams(teamsData || [])
      setUsers(usersData || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const assignManager = useCallback(async (teamId: string, userId: string | null) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ manager_id: userId })
        .eq('id', teamId)

      if (error) throw error

      toast({
        title: 'Success',
        description: userId ? 'Manager assigned successfully' : 'Manager removed successfully'
      })

      fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }, [supabase, toast, fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-full overflow-hidden">
        <Card>
          <CardHeader>
            <CardTitle>Team Manager Assignment</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3 p-4">
              {teams.map((team) => (
                <Card key={team.id} className="p-4">
                  <div className="space-y-2">
                    <div className="font-medium">{team.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Short: {team.short_name}
                    </div>
                    <div className="text-sm">
                      Manager: {team.managers?.email || 'No manager assigned'}
                    </div>
                    <select
                      className="w-full p-2 border rounded text-sm"
                      value={team.manager_id || ''}
                      onChange={(e) => assignManager(team.id, e.target.value || null)}
                      aria-label={`Select manager for ${team.name}`}
                    >
                      <option value="">No Manager</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Team Name</TableHead>
                    <TableHead className="w-[120px]">Short Name</TableHead>
                    <TableHead className="w-[200px]">Current Manager</TableHead>
                    <TableHead className="w-[250px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">
                        <div className="truncate" title={team.name}>
                          {team.name}
                        </div>
                      </TableCell>
                      <TableCell>{team.short_name}</TableCell>
                      <TableCell>
                        <div className="truncate" title={team.managers?.email || 'No manager assigned'}>
                          {team.managers?.email || 'No manager assigned'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          className="w-full max-w-[200px] p-2 border rounded text-sm"
                          value={team.manager_id || ''}
                          onChange={(e) => assignManager(team.id, e.target.value || null)}
                          aria-label={`Select manager for ${team.name}`}
                        >
                          <option value="">No Manager</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.email}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
} 
