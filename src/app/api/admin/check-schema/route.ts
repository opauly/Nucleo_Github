import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
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

    // Check announcements table structure
    const { data: announcementsColumns, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .limit(1)

    if (announcementsError) {
      console.error('Error checking announcements table:', announcementsError)
      return NextResponse.json(
        { error: 'Error checking announcements table structure' },
        { status: 500 }
      )
    }

    // Check devotionals table structure
    const { data: devotionalsColumns, error: devotionalsError } = await supabase
      .from('devotionals')
      .select('*')
      .limit(1)

    if (devotionalsError) {
      console.error('Error checking devotionals table:', devotionalsError)
      return NextResponse.json(
        { error: 'Error checking devotionals table structure' },
        { status: 500 }
      )
    }

    // Check events table structure
    const { data: eventsColumns, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1)

    if (eventsError) {
      console.error('Error checking events table:', eventsError)
      return NextResponse.json(
        { error: 'Error checking events table structure' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      announcements: {
        columns: announcementsColumns ? Object.keys(announcementsColumns[0] || {}) : [],
        hasAuthorId: announcementsColumns && announcementsColumns[0] && 'author_id' in announcementsColumns[0]
      },
      devotionals: {
        columns: devotionalsColumns ? Object.keys(devotionalsColumns[0] || {}) : [],
        hasAuthorId: devotionalsColumns && devotionalsColumns[0] && 'author_id' in devotionalsColumns[0]
      },
      events: {
        columns: eventsColumns ? Object.keys(eventsColumns[0] || {}) : [],
        hasStatus: eventsColumns && eventsColumns[0] && 'status' in eventsColumns[0],
        hasIsFeatured: eventsColumns && eventsColumns[0] && 'is_featured' in eventsColumns[0]
      },
      sqlCommands: {
        announcements: announcementsColumns && announcementsColumns[0] && !('author_id' in announcementsColumns[0]) 
          ? "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id);" 
          : null,
        devotionals: devotionalsColumns && devotionalsColumns[0] && !('author_id' in devotionalsColumns[0]) 
          ? "ALTER TABLE devotionals ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id);" 
          : null
      },
      schemaInfo: {
        announcements: {
          hasStatus: announcementsColumns && announcementsColumns[0] && 'status' in announcementsColumns[0],
          hasPublishedAt: announcementsColumns && announcementsColumns[0] && 'published_at' in announcementsColumns[0],
          hasIsFeatured: announcementsColumns && announcementsColumns[0] && 'is_featured' in announcementsColumns[0]
        },
        devotionals: {
          hasStatus: devotionalsColumns && devotionalsColumns[0] && 'status' in devotionalsColumns[0],
          hasPublishedAt: devotionalsColumns && devotionalsColumns[0] && 'published_at' in devotionalsColumns[0],
          hasIsFeatured: devotionalsColumns && devotionalsColumns[0] && 'is_featured' in devotionalsColumns[0]
        },
        events: {
          hasStatus: eventsColumns && eventsColumns[0] && 'status' in eventsColumns[0],
          hasIsFeatured: eventsColumns && eventsColumns[0] && 'is_featured' in eventsColumns[0]
        }
      }
    })

  } catch (error: unknown) {
    console.error('Error in schema check:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
