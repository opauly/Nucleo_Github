import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Get all event registrations with user profile and event data
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        profiles:profile_id (
          id,
          nombre,
          apellido1,
          apellido2,
          email
        ),
        events:event_id (
          id,
          title,
          start_date,
          location
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching event registrations:', error)
      return NextResponse.json(
        { error: 'Error fetching event registrations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      registrations: registrations || []
    })

  } catch (error: unknown) {
    console.error('Error in event registrations fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
