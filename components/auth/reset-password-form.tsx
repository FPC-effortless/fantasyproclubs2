import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth"

export function ResetPasswordForm() {
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { resetPassword } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError("")
      setIsLoading(true)
      await resetPassword(data.email)
      setIsSuccess(true)
    } catch (err) {
      setError("Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-8 p-8 bg-black/50 rounded-lg border border-green-500/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Check your email</h2>
          <p className="mt-2 text-sm text-gray-400">
            We&apos;ve sent you a password reset link. Please check your email to reset your password.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-black/50 rounded-lg border border-green-500/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-400">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
            {error}
          </div>
        )}

        <div>
          <Input
            {...register("email")}
            type="email"
            placeholder="Email address"
            className="bg-black/50 border-green-500/20 text-white"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="text-sm text-green-500 hover:text-green-400"
          >
            Back to login
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
              Sending reset link...
            </div>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>
    </div>
  )
} 
