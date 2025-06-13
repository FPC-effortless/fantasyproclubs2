export type TrophyType = 'team' | 'individual'

export interface Trophy {
  id: string
  name: string
  description: string
  type: TrophyType
  competitionId: string
  imageUrl: string
  createdAt: string
}

export interface TrophyAward {
  id: string
  trophyId: string
  competitionId: string
  recipientId: string // Can be either teamId or playerId depending on type
  awardedAt: string
  season?: string
  remarks?: string
}

export interface TrophyRecipient {
  id: string
  name: string
  type: 'team' | 'player'
  imageUrl?: string
} 
