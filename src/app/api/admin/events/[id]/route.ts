import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Fetch single event
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

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      event
    })

  } catch (error: unknown) {
    console.error('Error in event fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// PUT - Update event
export async function PUT(
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

    const { 
      title, 
      description, 
      start_date, 
      end_date, 
      location, 
      max_participants, 
      status, 
      is_featured = false, 
      team_id, 
      team_ids = [], 
      image_url 
    } = await request.json()

    if (!title || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields: title and start_date' },
        { status: 400 }
      )
    }

    const { data: event, error } = await supabase
      .from('events')
      .update({
        title,
        description: description || null,
        start_date,
        end_date: end_date || null,
        location: location || null,
        max_participants: max_participants || null,
        status,
        is_featured,
        team_id: team_id || null,
        image_url: image_url || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return NextResponse.json(
        { error: 'Error updating event' },
        { status: 500 }
      )
    }

    // Handle team associations update
    if (team_ids !== undefined) {
      // First, delete existing team associations
      const { error: deleteError } = await supabase
        .from('event_teams')
        .delete()
        .eq('event_id', id)

      if (deleteError) {
        console.error('Error deleting existing team associations:', deleteError)
      }

      // Then, add new team associations if any
      if (team_ids.length > 0) {
        const teamAssociations = team_ids.map((teamId: string) => ({
          event_id: id,
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
    }

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      event
    })

  } catch (error: unknown) {
    console.error('Error in event update:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE - Delete event
export async function DELETE(
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

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json(
        { error: 'Error deleting event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error: unknown) {
    console.error('Error in event deletion:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}



