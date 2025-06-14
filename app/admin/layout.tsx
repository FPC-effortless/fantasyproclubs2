import { AdminNav } from "@/components/admin/admin-nav"
import { toast } from "@/hooks/use-toast"
import { createClient } from '@/lib/supabase/server'
import { AdminLayoutClient } from './admin-layout-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  return <AdminLayoutClient supabase={supabase}>{children}</AdminLayoutClient>
}
