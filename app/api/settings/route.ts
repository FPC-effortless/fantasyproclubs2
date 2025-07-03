import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Check if user is admin
    console.log("Checking admin status for user:", session.user.id)
    let { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_type")
      .eq("id", session.user.id)
      .single()

    if (profileError?.code === "PGRST116") {
      // Profile doesn't exist, create it with admin role for first user
      console.log("Creating admin profile for first user:", session.user.id)
      const { count } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })

      const isFirstUser = count === 0

      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert([
          {
            id: session.user.id,
            user_type: isFirstUser ? "admin" : "fan", // Make first user admin
            display_name: session.user.email?.split("@")[0] || "User"
          }
        ])
        .select("user_type")
        .single()

      if (createError) {
        console.error("Error creating user profile:", createError)
        return NextResponse.json(
          { error: "Error creating user profile", details: createError.message },
          { status: 500 }
        )
      }

      profile = newProfile
    } else if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json(
        { error: "Error fetching user profile", details: profileError.message },
        { status: 500 }
      )
    }

    if (!profile || profile.user_type !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required", profile },
        { status: 403 }
      )
    }

    // Get settings from database
    let { data: settings, error: settingsError } = await supabase
      .from("system_settings")
      .select("*")
      .single()

    // If no settings exist, create default settings
    if (settingsError?.code === "PGRST116") {
      console.log("No system settings found, creating default settings")
      
      // Use service role client to bypass RLS for default settings creation
      const serviceRoleClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      const defaultSettings = {
        email_settings: {
          smtpHost: "",
          smtpPort: "",
          smtpUser: "",
          smtpPassword: "",
          senderEmail: "",
          enableEmailNotifications: true
        },
        notification_settings: {
          enablePushNotifications: true,
          enableInAppNotifications: true,
          matchReminders: true,
          competitionUpdates: true,
          teamUpdates: true
        },
        security_settings: {
          minPasswordLength: 8,
          requireSpecialChars: true,
          requireNumbers: true,
          maxLoginAttempts: 5,
          sessionTimeout: 30,
          enableTwoFactor: false
        },
        integration_settings: {
          discordWebhook: "",
          twitchApiKey: "",
          enableDiscordIntegration: false,
          enableTwitchIntegration: false
        },
        backup_settings: {
          enableAutoBackup: true,
          backupFrequency: "daily",
          backupRetentionDays: 30,
          includeUserData: true,
          includeMatchHistory: true
        }
      }

      const { data: newSettings, error: insertError } = await serviceRoleClient
        .from("system_settings")
        .insert([defaultSettings])
        .select("*")
        .single()

      if (insertError) {
        console.error("Error creating default settings:", insertError)
        return NextResponse.json(
          { error: "Error creating default settings", details: insertError.message },
          { status: 500 }
        )
      }

      settings = newSettings
    } else if (settingsError) {
      throw settingsError
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_type")
      .eq("id", session.user.id)
      .single()

    if (profileError || profile?.user_type !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const settings = await request.json()

    // Update settings in database
    const { error: updateError } = await supabase
      .from("system_settings")
      .upsert({
        id: 1, // Assuming we have a single settings record
        ...settings,
        updated_at: new Date().toISOString(),
      })

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
} 
