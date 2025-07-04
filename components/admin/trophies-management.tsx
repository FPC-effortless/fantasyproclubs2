"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trophy as TrophyIcon, Upload, Award, Users, User } from "lucide-react"
import { Trophy, TrophyType, TrophyAward, TrophyRecipient } from "@/types/trophy"
import { Competition } from "@/types/competition"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export function TrophiesManagement() {
  const [trophies, setTrophies] = useState<Trophy[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAwardDialog, setShowAwardDialog] = useState(false)
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null)
  const [recipients, setRecipients] = useState<TrophyRecipient[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [trophyType, setTrophyType] = useState<string>("")
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("")
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    fetchCompetitions()
    fetchTrophies()
  }, [])

  useEffect(() => {
    if (selectedTrophy) {
      fetchPotentialRecipients(selectedTrophy.type)
    }
  }, [selectedTrophy])

  async function fetchCompetitions() {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('name')

      if (error) throw error
      setCompetitions(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load competitions",
        variant: "destructive",
      })
    }
  }

  async function fetchTrophies() {
    try {
      let query = supabase.from("trophies").select("*")
      
      if (selectedCompetition && selectedCompetition !== "all") {
        query = query.eq("competition_id", selectedCompetition)
      }

      const { data, error } = await query
      
      if (error) throw error
      setTrophies(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch trophies",
        variant: "destructive",
      })
    }
  }

  async function fetchPotentialRecipients(type: TrophyType) {
    try {
      if (type === 'team') {
        const { data, error } = await supabase
          .from('teams')
          .select('id, name')
          .order('name')

        if (error) throw error
        setRecipients(data.map(team => ({
          id: team.id,
          name: team.name,
          type: 'team'
        })))
      } else {
        const { data, error } = await supabase
          .from('players')
          .select('id, name')
          .order('name')

        if (error) throw error
        setRecipients(data.map(player => ({
          id: player.id,
          name: player.name,
          type: 'player'
        })))
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load potential recipients",
        variant: "destructive",
      })
    }
  }

  const resetCreateForm = () => {
    setTrophyType("")
    setSelectedCompetitionId("")
    setShowCreateDialog(false)
  }

  const resetAwardForm = () => {
    setSelectedRecipientId("")
    setSelectedTrophy(null)
    setShowAwardDialog(false)
  }

  async function handleCreateTrophy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsUploading(true)
    try {
      const formData = new FormData(event.currentTarget)
      
      // First upload the image
      const imageFile = (formData.get('image') as File)
      if (!imageFile || imageFile.size === 0) {
        throw new Error('Please select an image')
      }

      const fileExt = imageFile.name.split('.').pop()
      const filePath = `trophies/${Date.now()}.${fileExt}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('trophies')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('trophies')
        .getPublicUrl(filePath)

      // Then create the trophy record
      const { error: dbError } = await supabase
        .from('trophies')
        .insert({
          name: formData.get('name'),
          description: formData.get('description'),
          type: formData.get('type'),
          competition_id: formData.get('competition_id'),
          image_url: publicUrl,
          created_at: new Date().toISOString()
        })

      if (dbError) throw dbError

      toast({
        title: "Success",
        description: "Trophy created successfully",
      })

      resetCreateForm()
      fetchTrophies()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create trophy",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function handleAwardTrophy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedTrophy) return
    
    const formData = new FormData(event.currentTarget)
    
    try {
      const { error } = await supabase
        .from('trophy_awards')
        .insert({
          trophy_id: selectedTrophy.id,
          competition_id: selectedTrophy.competitionId,
          recipient_id: formData.get('recipient_id'),
          awarded_at: new Date().toISOString(),
          season: formData.get('season'),
          remarks: formData.get('remarks')
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Trophy awarded successfully",
      })

      resetAwardForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to award trophy",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5" />
            Trophies Management
          </CardTitle>
          <CardDescription>
            Create and manage trophies and awards for competitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Select
                value={selectedCompetition}
                onValueChange={setSelectedCompetition}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by competition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Competitions</SelectItem>
                  {competitions.map((competition) => (
                    <SelectItem key={competition.id} value={competition.id}>
                      {competition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={(open) => {
              if (!open) resetCreateForm()
              else setShowCreateDialog(true)
            }}>
              <DialogTrigger asChild>
                <Button>
                  <TrophyIcon className="h-4 w-4 mr-2" />
                  Create Trophy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Trophy</DialogTitle>
                  <DialogDescription>
                    Add a new trophy or award for a competition
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTrophy} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Trophy Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      name="type" 
                      value={trophyType} 
                      onValueChange={setTrophyType}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trophy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team">Team Trophy</SelectItem>
                        <SelectItem value="individual">Individual Award</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="competition_id">Competition</Label>
                    <Select 
                      name="competition_id" 
                      value={selectedCompetitionId}
                      onValueChange={setSelectedCompetitionId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select competition" />
                      </SelectTrigger>
                      <SelectContent>
                        {competitions.map((competition) => (
                          <SelectItem key={competition.id} value={competition.id}>
                            {competition.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Trophy Image</Label>
                    <Input id="image" name="image" type="file" accept="image/*" required />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading && <Upload className="h-4 w-4 mr-2 animate-spin" />}
                      Create Trophy
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trophies.map((trophy) => (
              <Card key={trophy.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={trophy.imageUrl}
                    alt={trophy.name}
                    fill
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{trophy.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{trophy.description}</p>
                  <div className="flex items-center gap-2 mb-4">
                    {trophy.type === 'team' ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      {trophy.type === 'team' ? 'Team Trophy' : 'Individual Award'}
                    </span>
                  </div>
                  <Dialog open={showAwardDialog && selectedTrophy?.id === trophy.id} onOpenChange={(open) => {
                    if (!open) resetAwardForm()
                    else {
                      setShowAwardDialog(open)
                      setSelectedTrophy(trophy)
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Award className="h-4 w-4 mr-2" />
                        Award Trophy
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Award Trophy</DialogTitle>
                        <DialogDescription>
                          Select recipient for {trophy.name}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAwardTrophy} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="recipient_id">Recipient</Label>
                          <Select 
                            name="recipient_id" 
                            value={selectedRecipientId}
                            onValueChange={setSelectedRecipientId}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select recipient" />
                            </SelectTrigger>
                            <SelectContent>
                              {recipients.map((recipient) => (
                                <SelectItem key={recipient.id} value={recipient.id}>
                                  {recipient.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="season">Season</Label>
                          <Input id="season" name="season" placeholder="e.g. 2023/24" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="remarks">Remarks</Label>
                          <Textarea id="remarks" name="remarks" placeholder="Any additional comments" />
                        </div>

                        <DialogFooter>
                          <Button type="submit">
                            Award Trophy
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
