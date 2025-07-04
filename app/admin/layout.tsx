import { AdminLayoutClient } from './admin-layout-client'
import { createClient } from "@/lib/supabase/client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  return <AdminLayoutClient supabase={supabase}>{children}</AdminLayoutClient>
}
