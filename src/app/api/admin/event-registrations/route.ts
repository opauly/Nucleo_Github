import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

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
