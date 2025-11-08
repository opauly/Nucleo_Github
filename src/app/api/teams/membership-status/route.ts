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

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const userId = searchParams.get('userId')

    if (!teamId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: teamId and userId' },
        { status: 400 }
      )
    }

    // Check if user is a member of this team
    const { data: membership, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('profile_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking team membership status:', error)
      return NextResponse.json(
        { error: 'Error checking team membership status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      isMember: !!membership,
      membership: membership || null
    })

  } catch (error: unknown) {
    console.error('Error in team membership status check:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}




