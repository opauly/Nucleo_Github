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

    // Get all team memberships with user profile and team data
    const { data: memberships, error } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles:profile_id (
          id,
          nombre,
          apellido1,
          apellido2,
          email
        ),
        teams:team_id (
          id,
          name,
          description
        )
      `)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching team memberships:', error)
      return NextResponse.json(
        { error: 'Error fetching team memberships' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      memberships: memberships || []
    })

  } catch (error: unknown) {
    console.error('Error in team memberships fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
