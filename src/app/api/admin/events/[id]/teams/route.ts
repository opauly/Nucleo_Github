import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Fetch event teams
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const { data: eventTeams, error } = await supabase
      .from('event_teams')
      .select(`
        id,
        team_id,
        teams (
          id,
          name
        )
      `)
      .eq('event_id', id)

    if (error) {
      console.error('Error fetching event teams:', error)
      return NextResponse.json(
        { error: 'Error fetching event teams' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      teams: eventTeams || []
    })

  } catch (error: unknown) {
    console.error('Error in event teams fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

