'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { swissModelConfigSchema } from '@/lib/validations'
import type { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Info, Plus, Trash2 } from 'lucide-react'

type SwissModelConfig = z.infer<typeof swissModelConfigSchema>

interface SwissModelSetupProps {
  onSubmit: (config: SwissModelConfig) => void;
  initialConfig?: Partial<SwissModelConfig>;
}

export function SwissModelSetup({ onSubmit, initialConfig }: SwissModelSetupProps) {
  const [exclusions, setExclusions] = useState<
    { teamA: string; teamB: string; reason?: string }[]
  >(initialConfig?.exclusions || [])

  const form = useForm<SwissModelConfig>({
    resolver: zodResolver(swissModelConfigSchema),
    defaultValues: {
      number_of_teams: initialConfig?.number_of_teams || 16,
      matches_per_team: initialConfig?.matches_per_team || 5,
      same_country_restriction: initialConfig?.same_country_restriction ?? true,
      home_away_balance: initialConfig?.home_away_balance ?? true,
      direct_qualifiers: initialConfig?.direct_qualifiers || 4,
      playoff_qualifiers: initialConfig?.playoff_qualifiers || 8,
      tiebreakers: initialConfig?.tiebreakers || [
        'points',
        'goal_difference',
        'goals_for',
        'head_to_head',
        'initial_seed'
      ],
      exclusions: exclusions
    },
  })

  const handleSubmit = (data: SwissModelConfig) => {
    // Transform string values to numbers
    const transformedData = {
      ...data,
      number_of_teams: Number(data.number_of_teams),
      matches_per_team: Number(data.matches_per_team),
      direct_qualifiers: Number(data.direct_qualifiers),
      playoff_qualifiers: Number(data.playoff_qualifiers)
    }
    onSubmit(transformedData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Swiss Model Competition Setup</CardTitle>
            <CardDescription>
              Configure your Swiss-system tournament with advanced settings for team distribution,
              qualification rules, and match constraints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="number_of_teams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Teams</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        min={4} 
                        max={64}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the total number of teams (4-64)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="matches_per_team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matches Per Team</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        min={3} 
                        max={10}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of matches each team will play (3-10)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Rules & Restrictions */}
            <div className="space-y-4">
              <h4 className="font-medium">Rules & Restrictions</h4>
              
              <FormField
                control={form.control}
                name="same_country_restriction"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Same Country Restriction</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="home_away_balance"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Home/Away Balance</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Qualification Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Qualification Settings</h4>
              
              <FormField
                control={form.control}
                name="direct_qualifiers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direct Qualifiers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        min={0}
                        max={16}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of teams that qualify directly
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playoff_qualifiers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Playoff Qualifiers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        min={2}
                        max={16}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of teams that qualify for playoffs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tiebreakers */}
            <div className="space-y-4">
              <h4 className="font-medium">Tiebreakers</h4>
              <FormField
                control={form.control}
                name="tiebreakers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiebreaker Order</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value.map((tiebreaker, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{index + 1}.</span>
                            <span className="text-sm">{tiebreaker.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Team Exclusions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Team Exclusions</h4>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Define pairs of teams that cannot face each other</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <ScrollArea className="h-[200px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team A</TableHead>
                      <TableHead>Team B</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exclusions.map((exclusion, index) => (
                      <TableRow key={index}>
                        <TableCell>{exclusion.teamA}</TableCell>
                        <TableCell>{exclusion.teamB}</TableCell>
                        <TableCell>{exclusion.reason}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newExclusions = [...exclusions]
                              newExclusions.splice(index, 1)
                              setExclusions(newExclusions)
                              form.setValue('exclusions', newExclusions)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newExclusions = [
                    ...exclusions,
                    { teamA: '', teamB: '', reason: '' }
                  ]
                  setExclusions(newExclusions)
                  form.setValue('exclusions', newExclusions)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exclusion
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Save Swiss Model Configuration
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
} 
