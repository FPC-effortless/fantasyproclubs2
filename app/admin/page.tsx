import { createClient } from '@/lib/supabase/server'
import { AdminDashboardClient } from './admin-dashboard-client'

export default async function AdminPage() {
  const supabase = await createClient()

  return <AdminDashboardClient supabase={supabase} />
} 
