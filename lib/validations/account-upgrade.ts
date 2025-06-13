import { z } from 'zod'

export const accountUpgradeSchema = z.object({
  requested_role: z.enum(['player', 'manager'], {
    required_error: 'Please select a role',
  }),
  xbox_gamertag: z
    .string()
    .regex(/^[a-zA-Z0-9 ]{3,15}$/, 'Xbox Gamertag must be 3-15 characters, letters and numbers only')
    .optional()
    .nullable(),
  psn_id: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{3,16}$/, 'PSN ID must be 3-16 characters, letters, numbers, hyphens, and underscores')
    .optional()
    .nullable(),
  preferred_platform: z.enum(['xbox', 'playstation', 'both'], {
    required_error: 'Please select your preferred platform',
  }),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'professional'], {
    required_error: 'Please select your experience level',
  }),
  team_preference: z.string().min(1, 'Please enter your team preference'),
  additional_info: z.string().optional(),
}).refine(
  (data) => data.xbox_gamertag || data.psn_id,
  {
    message: 'Please provide at least one gaming tag (Xbox or PSN)',
    path: ['xbox_gamertag'],
  }
)

export type AccountUpgradeFormData = z.infer<typeof accountUpgradeSchema> 
