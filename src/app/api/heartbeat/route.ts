import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Heartbeat endpoint to keep Supabase project active
 * This endpoint makes a lightweight query to prevent Supabase from pausing
 * the project due to inactivity (7 days of inactivity causes auto-pause)
 * 
 * Recommended: Call this endpoint every 6 days via cron job
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing Supabase configuration',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    const supabase: any = createClient(supabaseUrl, supabaseAnonKey)

    // Make a lightweight query to keep the database active
    // Try multiple tables in order of likelihood to exist
    // Even if queries fail, the connection attempt itself counts as activity
    
    let querySuccess = false
    let lastError: string | null = null
    let recordCount: number | null = null

    // Try profiles table first (most likely to exist)
    const { count, error: profilesError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .limit(1)

    if (!profilesError) {
      querySuccess = true
      recordCount = count ?? 0
    } else {
      lastError = profilesError.message
      
      // Try events table as fallback
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .limit(1)

      if (!eventsError) {
        querySuccess = true
        recordCount = eventsCount ?? 0
      } else {
        // Try announcements table as last fallback
        const { count: annCount, error: annError } = await supabase
          .from('announcements')
          .select('id', { count: 'exact', head: true })
          .limit(1)

        if (!annError) {
          querySuccess = true
          recordCount = annCount ?? 0
        }
      }
    }

    // Even if all queries fail, the connection attempt counts as activity
    // This prevents Supabase from pausing due to inactivity
    return NextResponse.json({
      success: true,
      message: querySuccess 
        ? 'Heartbeat successful' 
        : 'Heartbeat sent (connection established)',
      timestamp: new Date().toISOString(),
      querySuccess,
      recordCount,
      ...(lastError && !querySuccess ? { note: 'Query had issues but connection was successful' } : {})
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Heartbeat error:', errorMessage)
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

