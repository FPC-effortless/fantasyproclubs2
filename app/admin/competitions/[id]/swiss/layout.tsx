// CLEAN BUILD TRIGGER
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Swiss Model Competition Management',
  description: 'Manage your Swiss model competition with advanced draw and scheduling features.',
}

type SwissLayoutComponentProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function SwissLayout({ children, params }: SwissLayoutComponentProps) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    const { id } = await params;

    const { data: competition, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .eq('type', 'swiss')
      .single()

    if (error) {
      console.error('Error loading competition:', error)
      redirect('/admin/competitions')
    }

    if (!competition) {
      console.error('Competition not found or not a Swiss model')
      redirect('/admin/competitions')
    }

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {children}
      </div>
    )
  } catch (error) {
    console.error('Error in Swiss layout:', error)
    redirect('/admin/competitions')
  }
} 