import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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

    // Add team_leader column to team_members table
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE team_members ADD COLUMN IF NOT EXISTS team_leader BOOLEAN DEFAULT FALSE;'
    })

    if (error) {
      console.error('Error adding team_leader column:', error)
      return NextResponse.json(
        { error: 'Error adding team_leader column to team_members table' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Team leader column added successfully'
    })

  } catch (error: unknown) {
    console.error('Error in add team leader column:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}




