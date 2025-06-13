import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { upgradeRequestSchema, type UpgradeRequestFormData } from "@/lib/validations/auth"

export function UpgradeRequestForm() {
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { requestUpgrade } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpgradeRequestFormData>({
    resolver: zodResolver(upgradeRequestSchema),
  })

  const onSubmit = async (data: UpgradeRequestFormData) => {
    try {
      setError("")
      setIsLoading(true)
      await requestUpgrade(data.reason)
      setIsSuccess(true)
    } catch (err) {
      setError("Failed to submit upgrade request")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-8 p-8 bg-black/50 rounded-lg border border-green-500/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Request submitted</h2>
          <p className="mt-2 text-sm text-gray-400">
            We&apos;ve received your upgrade request. We&apos;ll review it and get back to you soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-black/50 rounded-lg border border-green-500/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Request Pro Account</h2>
        <p className="mt-2 text-sm text-gray-400">
          Tell us why you&apos;d like to upgrade to a Pro account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md">
            {error}
          </div>
        )}

        <div>
          <Textarea
            {...register("reason")}
            placeholder="Why do you want to upgrade to a Pro account?"
            className="min-h-[150px] bg-black/50 border-green-500/20 text-white"
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-500">{errors.reason.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
              Submitting request...
            </div>
          ) : (
            "Submit request"
          )}
        </Button>
      </form>
    </div>
  )
} 
