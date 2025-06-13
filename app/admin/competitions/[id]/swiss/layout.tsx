// CLEAN BUILD TRIGGER
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Swiss Model Competition Management',
  description: 'Manage your Swiss model competition with advanced draw and scheduling features.',
}

export default async function SwissLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  // Get cookie store for Supabase client
  const cookieStore = cookies()
  
  // Create Supabase client
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  })

  try {
    // Check if competition exists and is a Swiss model
    const { data: competition, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', params.id)
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