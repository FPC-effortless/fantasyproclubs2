'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PlayerPriceManagement from '@/components/admin/player-price-management'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

export default function FantasyManagementPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const supabase = createClient()

  const testUserPermissions = async () => {
    console.log('=== USER PERMISSIONS TEST ===')
    
    try {
      // Test 1: Check current user
      console.log('Test 1: Checking current user...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        return
      }
      
      console.log('Current user ID:', user?.id)
      console.log('Current user email:', user?.email)
      
      // Test 2: Check user profile
      console.log('Test 2: Checking user profile...')
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, user_type, role, display_name, email')
        .eq('id', user?.id)
        .single()
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        return
      }
      
      console.log('User profile:', profile)
      
      // Test 3: Check if user is admin
      console.log('Test 3: Checking admin status...')
      const isAdmin = profile?.user_type === 'admin'
      console.log('Is user admin?', isAdmin)
      
      if (!isAdmin) {
        console.log('❌ USER IS NOT AN ADMIN - This is the problem!')
        console.log('Current user_type:', profile?.user_type)
        console.log('Expected user_type: admin')
        
        // Let's see what user types exist
        const { data: allUsers, error: allUsersError } = await supabase
          .from('user_profiles')
          .select('user_type, display_name, email')
          .limit(10)
        
        if (!allUsersError) {
          console.log('Sample users and their types:', allUsers)
        }
        
        return
      }
      
      console.log('✓ User is admin')
      
      // Test 4: Try reading from fantasy_player_stats
      console.log('Test 4: Testing read access to fantasy_player_stats...')
      const { data: _readTest, error: readError } = await supabase
        .from('fantasy_player_stats')
        .select('*')
        .limit(1)
      
      if (readError) {
        console.error('❌ Read access failed:', readError)
        return
      }
      
      console.log('✓ Read access successful')
      
      // Test 5: Try inserting a test record
      console.log('Test 5: Testing insert access to fantasy_player_stats...')
      
      // First get a player ID for testing
      const { data: testPlayer, error: playerError } = await supabase
        .from('players')
        .select('id')
        .limit(1)
        .single()
      
      if (playerError) {
        console.error('Error getting test player:', playerError)
        return
      }
      
      // Get a competition ID
      const { data: testComp, error: compError } = await supabase
        .from('competitions')
        .select('id')
        .limit(1)
        .single()
      
      if (compError) {
        console.error('Error getting test competition:', compError)
        return
      }
      
      const testRecord = {
        player_id: testPlayer.id,
        competition_id: testComp.id,
        fantasy_points: 999, // Using unique value to identify test record
        fantasy_price: 10.0
      }
      
      const { data: insertTest, error: insertError } = await supabase
        .from('fantasy_player_stats')
        .upsert([testRecord], {
          onConflict: 'player_id,competition_id'
        })
        .select()
      
      if (insertError) {
        console.error('❌ Insert access failed:', insertError)
        console.error('Insert error details:', {
          message: insertError?.message,
          code: insertError?.code,
          details: insertError?.details,
          hint: insertError?.hint
        })
        return
      }
      
      console.log('✓ Insert access successful:', insertTest)
      
      // Clean up test record
      await supabase
        .from('fantasy_player_stats')
        .delete()
        .eq('fantasy_points', 999)
      
      console.log('=== ALL PERMISSION TESTS PASSED ===')
      
    } catch (error) {
      console.error('=== PERMISSION TEST FAILED ===')
      console.error('Error:', error)
    }
  }

  const testDatabaseOperations = async () => {
    console.log('=== DATABASE OPERATIONS TEST ===')
    
    try {
      // Test 1: Check if competitions table is accessible
      console.log('Test 1: Checking competitions table...')
      const { data: allCompetitions, error: allCompsError } = await supabase
        .from('competitions')
        .select('id, name, fantasy_enabled')
        .limit(5)
      
      if (allCompsError) {
        console.error('Error accessing competitions table:', allCompsError)
        return
      }
      console.log('✓ Competitions table accessible. Found:', allCompetitions?.length, 'competitions')
      console.log('Sample competition:', allCompetitions?.[0])
      
      // Test 2: Check fantasy-enabled competitions
      console.log('Test 2: Checking fantasy-enabled competitions...')
      const { data: fantasyComps, error: fantasyError } = await supabase
        .from('competitions')
        .select('id, name, fantasy_enabled')
        .eq('fantasy_enabled', true)
      
      if (fantasyError) {
        console.error('Error fetching fantasy competitions:', fantasyError)
        return
      }
      console.log('✓ Fantasy competitions found:', fantasyComps?.length)
      
      if (!fantasyComps || fantasyComps.length === 0) {
        console.log('❌ No fantasy-enabled competitions found')
        return
      }
      
      const testComp = fantasyComps[0]
      console.log('Using test competition:', testComp)
      
      // Test 3: Check competition_teams table
      console.log('Test 3: Checking competition_teams...')
      const { data: compTeams, error: compTeamsError } = await supabase
        .from('competition_teams')
        .select('team_id')
        .eq('competition_id', testComp.id)
      
      if (compTeamsError) {
        console.error('Error fetching competition teams:', compTeamsError)
        return
      }
      console.log('✓ Competition teams found:', compTeams?.length)
      
      if (!compTeams || compTeams.length === 0) {
        console.log('❌ No teams found in competition')
        return
      }
      
      // Test 4: Check players table
      console.log('Test 4: Checking players...')
      const teamIds = compTeams.map(ct => ct.team_id)
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id')
        .in('team_id', teamIds)
        .limit(5)
      
      if (playersError) {
        console.error('Error fetching players:', playersError)
        return
      }
      console.log('✓ Players found:', players?.length)
      
      if (!players || players.length === 0) {
        console.log('❌ No players found in teams')
        return
      }
      
      // Test 5: Check fantasy_player_stats table
      console.log('Test 5: Checking fantasy_player_stats table...')
      const { data: existingStats, error: statsError } = await supabase
        .from('fantasy_player_stats')
        .select('*')
        .eq('competition_id', testComp.id)
        .limit(5)
      
      if (statsError) {
        console.error('Error accessing fantasy_player_stats:', statsError)
        return
      }
      console.log('✓ Fantasy stats table accessible. Existing records:', existingStats?.length)
      
      // Test 6: Try inserting one record
      console.log('Test 6: Testing insert operation...')
      const testRecord = {
        player_id: players[0].id,
        competition_id: testComp.id,
        fantasy_points: 0,
        fantasy_price: 5.0
      }
      
      const { data: insertResult, error: insertError } = await supabase
        .from('fantasy_player_stats')
        .upsert([testRecord], {
          onConflict: 'player_id,competition_id'
        })
        .select()
      
      if (insertError) {
        console.error('❌ Insert operation failed:', insertError)
        console.error('Insert error details:', {
          message: insertError?.message,
          code: insertError?.code,
          details: insertError?.details,
          hint: insertError?.hint
        })
        return
      }
      
      console.log('✓ Insert operation successful:', insertResult)
      console.log('=== ALL TESTS PASSED ===')
      
    } catch (error) {
      console.error('=== TEST FAILED ===')
      console.error('Caught error:', error)
      console.error('Error type:', typeof error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    }
  }

  const initializeAllFantasyStats = async () => {
    try {
      setIsInitializing(true)
      console.log('Initializing fantasy stats for all competitions...')

      // Get all fantasy-enabled competitions
      console.log('Step 1: Fetching fantasy-enabled competitions...')
      const { data: competitions, error: competitionsError } = await supabase
        .from('competitions')
        .select('id, name, fantasy_enabled')
        .eq('fantasy_enabled', true)

      if (competitionsError) {
        console.error('Competitions query error:', competitionsError)
        throw competitionsError
      }

      console.log('Found competitions:', competitions)

      if (!competitions || competitions.length === 0) {
        toast({
          title: "No fantasy competitions found",
          description: "Please enable fantasy for at least one competition first.",
          variant: "destructive",
        })
        return
      }

      // Initialize stats for each competition
      for (const competition of competitions) {
        console.log(`Step 2: Processing competition: ${competition.name} (${competition.id})`)
        
        // Get teams in this competition
        console.log(`Step 3: Fetching teams for competition ${competition.id}...`)
        const { data: competitionTeams, error: teamsError } = await supabase
          .from('competition_teams')
          .select('team_id')
          .eq('competition_id', competition.id)

        if (teamsError) {
          console.error('Teams query error:', teamsError)
          throw teamsError
        }

        console.log(`Found ${competitionTeams?.length || 0} teams in competition`)

        if (competitionTeams && competitionTeams.length > 0) {
          const teamIds = competitionTeams.map(ct => ct.team_id)
          console.log('Team IDs:', teamIds)

          // Get all players from these teams
          console.log(`Step 4: Fetching players for teams...`)
          const { data: players, error: playersError } = await supabase
            .from('players')
            .select('id')
            .in('team_id', teamIds)

          if (playersError) {
            console.error('Players query error:', playersError)
            throw playersError
          }

          console.log(`Found ${players?.length || 0} players`)

          if (players && players.length > 0) {
            // Create fantasy stats records
            console.log(`Step 5: Creating fantasy stats for ${players.length} players...`)
            const fantasyStats = players.map(player => ({
              player_id: player.id,
              competition_id: competition.id,
              fantasy_points: 0,
              fantasy_price: 5.0
            }))

            console.log('Fantasy stats to insert:', fantasyStats.slice(0, 2), '...') // Log first 2 records

            const { data: insertResult, error: insertError } = await supabase
              .from('fantasy_player_stats')
              .upsert(fantasyStats, {
                onConflict: 'player_id,competition_id'
              })
              .select()

            if (insertError) {
              console.error('Insert error:', insertError)
              console.error('Insert error details:', {
                message: insertError?.message,
                code: insertError?.code,
                details: insertError?.details,
                hint: insertError?.hint
              })
              throw insertError
            }

            console.log(`Successfully initialized ${players.length} players for ${competition.name}`)
            console.log('Insert result:', insertResult?.slice(0, 2), '...') // Log first 2 results
          }
        }
      }

      toast({
        title: "Success",
        description: "Fantasy stats initialized for all competitions",
      })
    } catch (error: any) {
      console.error('Error initializing fantasy stats:', error)
      console.error('Error type:', typeof error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      })
      
      // Try to stringify the error to see if there's hidden info
      try {
        console.error('Error stringified:', JSON.stringify(error, null, 2))
      } catch (e) {
        console.error('Could not stringify error')
      }

      toast({
        title: "Error",
        description: error?.message || error?.details || "Failed to initialize fantasy stats",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Fantasy Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={testUserPermissions}
            variant="outline"
            size="sm"
          >
            Test User Permissions
          </Button>
          <Button
            onClick={testDatabaseOperations}
            variant="outline"
            size="sm"
          >
            Test DB Operations
          </Button>
          <Button
            onClick={initializeAllFantasyStats}
            disabled={isInitializing}
            variant="outline"
          >
            {isInitializing ? 'Initializing...' : 'Initialize All Fantasy Stats'}
          </Button>
        </div>
      </div>
      <PlayerPriceManagement />
    </div>
  )
} 
