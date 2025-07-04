import { AdminDashboardClient } from './admin-dashboard-client'
import { createClient } from "@/lib/supabase/client"

export default async function AdminPage() {
  const supabase = await createClient()

  return <AdminDashboardClient supabase={supabase} />
} 
