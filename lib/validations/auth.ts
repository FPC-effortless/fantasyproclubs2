import { z } from "zod"

// Gamertag validation patterns
const xboxGamertagPattern = /^[a-zA-Z0-9]{1,15}$/
const psnTagPattern = /^[a-zA-Z0-9_-]{3,16}$/

// Common gamertag validation messages
const gamertagMessages = {
  xbox: "Xbox Gamertag must be 1-15 characters long and can only contain letters and numbers",
  psn: "PSN ID must be 3-16 characters long and can only contain letters, numbers, underscores, and hyphens",
}

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string(),
  full_name: z.string().min(2, "Full name must be at least 2 characters").optional(),
  xbox_gamertag: z
    .string()
    .regex(xboxGamertagPattern, gamertagMessages.xbox)
    .optional()
    .nullable(),
  psn_tag: z
    .string()
    .regex(psnTagPattern, gamertagMessages.psn)
    .optional()
    .nullable(),
  preferred_platform: z
    .enum(["xbox", "playstation", "both"])
    .optional()
    .nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const upgradeRequestSchema = z.object({
  reason: z.string().min(10, "Please provide a detailed reason (minimum 10 characters)"),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
export type UpgradeRequestFormData = z.infer<typeof upgradeRequestSchema>

// Profile edit schema
export const profileEditSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .optional(),
  full_name: z.string().min(2, "Full name must be at least 2 characters").optional(),
  xbox_gamertag: z
    .string()
    .regex(xboxGamertagPattern, gamertagMessages.xbox)
    .optional()
    .nullable(),
  psn_id: z
    .string()
    .regex(psnTagPattern, gamertagMessages.psn)
    .optional()
    .nullable(),
  preferred_platform: z
    .enum(["xbox", "playstation", "both"])
    .optional()
    .nullable(),
  experience_level: z
    .enum(["beginner", "intermediate", "advanced", "professional"])
    .optional()
    .nullable(),
  show_gaming_tags: z.boolean().optional(),
  show_platform: z.boolean().optional(),
  allow_team_invites: z.boolean().optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional(),
})

// Gamertag verification schema
export const gamertagVerificationSchema = z.object({
  platform: z.enum(["xbox", "playstation"]),
  verification_code: z
    .string()
    .length(6, "Verification code must be 6 characters")
    .regex(/^[A-Z0-9]+$/, "Verification code must contain only uppercase letters and numbers"),
})

// Helper function to validate gamertag format
export function validateGamertag(gamertag: string, platform: "xbox" | "playstation"): boolean {
  if (platform === "xbox") {
    return xboxGamertagPattern.test(gamertag)
  }
  return psnTagPattern.test(gamertag)
}

// Helper function to generate verification code
export function generateVerificationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
} 
