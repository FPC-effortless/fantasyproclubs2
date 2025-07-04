import { createBrowserClient } from "@supabase/ssr"
import { createClient } from "@/lib/supabase/client";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
} 
