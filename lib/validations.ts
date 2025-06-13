import { z } from 'zod'

// User validation
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  avatar_url: z.string().url('Invalid URL').optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  role: z.enum(['user', 'admin', 'moderator']),
})

// Team validation
export const teamSchema = z.object({
  name: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(50, 'Team name must be at most 50 characters'),
  short_name: z
    .string()
    .min(1, 'Team abbreviation is required')
    .max(5, 'Team abbreviation must be at most 5 characters')
    .regex(/^[A-Z0-9]+$/, 'Team abbreviation must be uppercase letters and numbers only'),
  logo_url: z.string().url('Invalid URL').optional(),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  manager_id: z.string().uuid('Invalid manager ID'),
})

// Player validation
export const playerSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  team_id: z.string().uuid('Invalid team ID'),
  position: z.enum(['GK', 'DEF', 'MID', 'FWD']),
  number: z.number().int().min(1).max(99),
  status: z.enum(['active', 'injured', 'suspended', 'inactive']),
  goals: z.number().int().min(0),
  assists: z.number().int().min(0),
  cleanSheets: z.number().int().min(0),
  yellowCards: z.number().int().min(0),
  redCards: z.number().int().min(0),
  points: z.number().int(),
})

// Swiss Model specific validation
export const swissModelConfigSchema = z.object({
  number_of_teams: z.coerce.number().int().min(4).max(64),
  matches_per_team: z.coerce.number().int().min(3).max(10),
  same_country_restriction: z.boolean(),
  home_away_balance: z.boolean(),
  direct_qualifiers: z.coerce.number().int().min(0).max(16),
  playoff_qualifiers: z.coerce.number().int().min(2).max(16),
  tiebreakers: z.array(
    z.enum([
      'points',
      'goal_difference',
      'goals_for',
      'head_to_head',
      'initial_seed',
      'random'
    ])
  ).default(['points', 'goal_difference', 'goals_for', 'head_to_head', 'initial_seed']),
  exclusions: z.array(
    z.object({
      teamA: z.string().uuid(),
      teamB: z.string().uuid(),
      reason: z.string().optional()
    })
  ).default([])
})

// Update the existing competitionSchema
export const competitionSchema = z.object({
  name: z
    .string()
    .min(2, 'Competition name must be at least 2 characters')
    .max(100, 'Competition name must be at most 100 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters'),
  type: z.enum(['league', 'cup', 'friendly', 'swiss']),
  status: z.enum(['upcoming', 'active', 'completed']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  max_teams: z.number().int().min(2),
  entry_fee: z.number().min(0),
  prize_pool: z.number().min(0),
  rules: z.string().max(5000, 'Rules must be at most 5000 characters'),
  stream_link: z.string().url('Invalid URL').optional(),
  // Add Swiss model specific configuration
  swiss_config: swissModelConfigSchema.optional()
})

// Match validation
export const matchSchema = z.object({
  competition_id: z.string().uuid('Invalid competition ID'),
  home_team_id: z.string().uuid('Invalid home team ID'),
  away_team_id: z.string().uuid('Invalid away team ID'),
  scheduled_time: z.string().datetime(),
  status: z.enum(['scheduled', 'live', 'completed', 'cancelled']),
  venue: z.string().max(200, 'Venue must be at most 200 characters'),
  home_team_stats: z
    .object({
      goals: z.number().int().min(0),
      possession: z.number().min(0).max(100),
      shots: z.number().int().min(0),
      shots_on_target: z.number().int().min(0),
      corners: z.number().int().min(0),
      fouls: z.number().int().min(0),
      players: z.record(
        z.string(),
        z.object({
          goals: z.number().int().min(0),
          assists: z.number().int().min(0),
          yellowCards: z.number().int().min(0),
          redCards: z.number().int().min(0),
          position: z.enum(['GK', 'DEF', 'MID', 'FWD']),
        })
      ),
    })
    .optional(),
  away_team_stats: z
    .object({
      goals: z.number().int().min(0),
      possession: z.number().min(0).max(100),
      shots: z.number().int().min(0),
      shots_on_target: z.number().int().min(0),
      corners: z.number().int().min(0),
      fouls: z.number().int().min(0),
      players: z.record(
        z.string(),
        z.object({
          goals: z.number().int().min(0),
          assists: z.number().int().min(0),
          yellowCards: z.number().int().min(0),
          redCards: z.number().int().min(0),
          position: z.enum(['GK', 'DEF', 'MID', 'FWD']),
        })
      ),
    })
    .optional(),
})

// Fantasy Team validation
export const fantasyTeamSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  competition_id: z.string().uuid('Invalid competition ID'),
  name: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(50, 'Team name must be at most 50 characters'),
  budget: z.number().min(0),
  points: z.number().int(),
})

// Notification validation
export const notificationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  type: z.enum(['match', 'transfer', 'award', 'system']),
  title: z.string().max(200, 'Title must be at most 200 characters'),
  message: z.string().max(1000, 'Message must be at most 1000 characters'),
  read: z.boolean(),
  link: z.string().url('Invalid URL').optional(),
})

// Transfer validation
export const transferSchema = z.object({
  player_id: z.string().uuid('Invalid player ID'),
  from_team_id: z.string().uuid('Invalid from team ID'),
  to_team_id: z.string().uuid('Invalid to team ID'),
  status: z.enum(['pending', 'approved', 'rejected', 'completed']),
  transfer_fee: z.number().min(0),
  transfer_date: z.string().datetime(),
})

// Award validation
export const awardSchema = z.object({
  competition_id: z.string().uuid('Invalid competition ID'),
  player_id: z.string().uuid('Invalid player ID'),
  type: z.enum([
    'player_of_the_month',
    'top_scorer',
    'best_goalkeeper',
    'best_defender',
    'best_midfielder',
    'best_forward',
  ]),
  season: z.string().max(20, 'Season must be at most 20 characters'),
  month: z.number().int().min(1).max(12).optional(),
}) 
