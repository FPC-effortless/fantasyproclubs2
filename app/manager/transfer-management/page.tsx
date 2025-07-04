"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  ArrowLeft, 
  Search,
  Plus,
  Minus,
  DollarSign,
  Clock
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function TransferManagementPage() {
  const [transfers, setTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransfers()
  }, [])

  const fetchTransfers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransfers(data || [])
    } catch (error) {
      console.error('Error fetching transfers:', error)
      toast({
        title: "Error",
        description: "Failed to load transfer data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading transfer data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/60 to-black/90 pb-8">
      <div className="w-full pt-8 px-4 space-y-8">
        {/* Header */}
        <div>
          <Link href="/profile" className="flex items-center gap-2 text-green-400 hover:text-green-300 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-green-100">Transfer Management</h1>
          <p className="text-gray-400">Manage player transfers and team composition</p>
        </div>

        {/* Transfer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
            <CardContent className="p-6 text-center">
              <Plus className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-400">5</div>
              <div className="text-gray-400 text-sm">Players In</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-900/20 to-gray-900/40 border-red-800/30">
            <CardContent className="p-6 text-center">
              <Minus className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-red-400">3</div>
              <div className="text-gray-400 text-sm">Players Out</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-400">$50K</div>
              <div className="text-gray-400 text-sm">Net Spend</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-900/20 to-gray-900/40 border-purple-800/30">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-400">2</div>
              <div className="text-gray-400 text-sm">Pending</div>
            </CardContent>
          </Card>
        </div>

        {/* Transfer List */}
        <Card className="bg-gradient-to-r from-green-900/30 to-gray-900/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-green-100 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transfers.slice(0, 5).map((transfer) => (
                <div key={transfer.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center">
                      {transfer.type === 'in' ? (
                        <Plus className="w-6 h-6 text-green-400" />
                      ) : (
                        <Minus className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-100">{transfer.player_name}</h3>
                      <p className="text-gray-400 text-sm">
                        {transfer.type === 'in' ? 'Signed from' : 'Sold to'} {transfer.from_team}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">${transfer.fee}</span>
                        </div>
                        <span className="text-gray-400 text-sm">{transfer.position}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                      {transfer.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                    <div className="text-right">
                      <div className="text-yellow-400 font-semibold">{transfer.rating}</div>
                      <div className="text-gray-400 text-xs">Rating</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transfer Market */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-gray-900/40 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-green-100">Transfer Market</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search for players..."
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400"
                  />
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h3 className="font-semibold text-green-100 mb-2">Available Players</h3>
                  <p className="text-gray-400 text-sm mb-4">Browse players available for transfer</p>
                  <Button variant="outline" className="w-full">
                    View Market
                  </Button>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <h3 className="font-semibold text-green-100 mb-2">Loan Market</h3>
                  <p className="text-gray-400 text-sm mb-4">Short-term player loans</p>
                  <Button variant="outline" className="w-full">
                    View Loans
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 