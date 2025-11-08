import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
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

    console.log('🧹 Starting database cleanup...')

    // Clean all tables in the correct order (respecting foreign keys)
    const tablesToClean = [
      'event_registrations', // Has foreign keys to events and profiles
      'team_members',        // Has foreign keys to teams and profiles
      'contact_messages',    // No foreign keys
      'devotionals',         // No foreign keys
      'announcements',       // No foreign keys
      'events',              // Has foreign key to teams
      'teams'                // Referenced by other tables
    ]

    for (const table of tablesToClean) {
      console.log(`🗑️ Cleaning ${table}...`)
      
      // For all tables, use a condition that will match all rows
      // We'll use a condition that's always true: team_id is not null (for team_members) or created_at is not null (for others)
      const condition = table === 'team_members' ? 'team_id' : 'created_at';
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .not(condition, 'is', null) // This will match all rows since these columns are never null

      if (deleteError) {
        console.error(`❌ Error cleaning ${table}:`, deleteError.message)
        return NextResponse.json(
          { error: `Failed to clean ${table}: ${deleteError.message}` },
          { status: 500 }
        )
      }

      console.log(`✅ ${table} cleaned successfully`)
    }

    console.log('🎉 Database cleanup completed!')

    return NextResponse.json({ 
      success: true, 
      message: 'Database cleaned successfully',
      tablesCleaned: tablesToClean
    })

  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error)
    return NextResponse.json(
      { error: 'Unexpected error during cleanup' },
      { status: 500 }
    )
  }
}
