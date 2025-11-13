import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyEventSubscribers } from '@/lib/email/notify-subscribers'

// GET - Fetch all events
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

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Error fetching events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      events: events || []
    })

  } catch (error: unknown) {
    console.error('Error in events fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// POST - Create new event
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

    const { 
      title, 
      description, 
      start_date, 
      end_date, 
      location, 
      max_participants, 
      status = 'draft', 
      is_featured = false, 
      team_id, 
      team_ids = [], 
      created_by, 
      image_url,
      is_recurring = false,
      recurrence_type,
      recurrence_pattern,
      recurrence_days,
      recurrence_dates,
      recurrence_end_date,
      recurrence_start_date
    } = await request.json()

    if (!title || !start_date || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields: title, start_date, and created_by' },
        { status: 400 }
      )
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert([
        {
          title,
          description: description || null,
          start_date,
          end_date: end_date || null,
          location: location || null,
          max_participants: max_participants || null,
          status,
          is_featured,
          team_id: team_id || null,
          created_by,
          image_url: image_url || null,
          is_recurring: is_recurring || false,
          recurrence_type: is_recurring ? recurrence_type : null,
          recurrence_pattern: is_recurring ? recurrence_pattern : null,
          recurrence_days: is_recurring && recurrence_pattern === 'days' ? recurrence_days : null,
          recurrence_dates: is_recurring && recurrence_pattern === 'dates' ? recurrence_dates : null,
          recurrence_end_date: is_recurring && recurrence_end_date ? recurrence_end_date : null,
          recurrence_start_date: is_recurring && recurrence_start_date ? recurrence_start_date : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return NextResponse.json(
        { error: 'Error creating event' },
        { status: 500 }
      )
    }

    // Handle team associations if provided
    if (team_ids && team_ids.length > 0) {
      const teamAssociations = team_ids.map((teamId: string) => ({
        event_id: event.id,
        team_id: teamId
      }))

      const { error: teamError } = await supabase
        .from('event_teams')
        .insert(teamAssociations)

      if (teamError) {
        console.error('Error creating team associations:', teamError)
        // Don't fail the entire request, just log the error
      }
    }

    // Send email notifications if published
    if (status === 'published' && event) {
      // Don't await - send emails in background
      notifyEventSubscribers(
        event.id,
        event.title,
        event.start_date,
        event.location
      ).catch(error => {
        console.error('Error sending event notifications:', error)
        // Don't fail the request if email sending fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event
    })

  } catch (error: unknown) {
    console.error('Error in event creation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}



