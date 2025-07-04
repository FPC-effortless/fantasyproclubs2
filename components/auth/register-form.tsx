import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function RegisterForm() {
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("")
      setIsLoading(true)
      await signUp(data.email, data.password)
      setIsSuccess(true)
    } catch (err) {
      setError("Failed to create account")
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
            We&apos;ve sent you a verification link. Please check your email to complete registration.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-black/50 rounded-lg border border-green-500/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Create an account</h2>
        <p className="mt-2 text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-green-500 hover:text-green-400">
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
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

          <div>
            <Input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="bg-black/50 border-green-500/20 text-white"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm password"
              className="bg-black/50 border-green-500/20 text-white"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
              Creating account...
            </div>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </div>
  )
} 
