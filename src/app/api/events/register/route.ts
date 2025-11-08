import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { EmailService } from '@/lib/email/email-service'

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

    // Get the request body
    const { eventId, userId, notes } = await request.json()

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId and userId' },
        { status: 400 }
      )
    }

    // 1. Check if user exists and is a member
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // 2. Check if event exists and is published
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('status', 'published')
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found or not available for registration' },
        { status: 404 }
      )
    }

    // 3. Check if event is in the future (use end_date if it exists, otherwise use start_date)
    const now = new Date()
    const startDate = new Date(event.start_date)
    const endDate = event.end_date ? new Date(event.end_date) : null
    
    // An event is in the future if:
    // - It has an end_date and it's in the future, OR
    // - The start_date is in the future
    const isEventInFuture = (endDate && endDate > now) || startDate > now
    
    if (!isEventInFuture) {
      return NextResponse.json(
        { error: 'Cannot register for past events' },
        { status: 400 }
      )
    }

    // 4. Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('profile_id', userId)
      .single()

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'User is already registered for this event' },
        { status: 400 }
      )
    }

    // 5. Check event capacity if max_participants is set
    if (event.max_participants) {
      const { data: registrations, error: countError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('status', 'pending')

      if (countError) {
        console.error('Error counting registrations:', countError)
        return NextResponse.json(
          { error: 'Error checking event capacity' },
          { status: 500 }
        )
      }

      const registeredCount = registrations?.length || 0
      if (registeredCount >= event.max_participants) {
        return NextResponse.json(
          { error: 'Event is at full capacity' },
          { status: 400 }
        )
      }
    }

    // 6. Create the registration
    const { data: registration, error: registrationError } = await supabase
      .from('event_registrations')
      .insert([
        {
          event_id: eventId,
          profile_id: userId,
          status: 'pending',
          notes: notes || null
        }
      ])
      .select()
      .single()

    if (registrationError) {
      console.error('Error creating registration:', registrationError)
      return NextResponse.json(
        { error: 'Failed to create registration' },
        { status: 500 }
      )
    }

    // 7. Get event details for response and email
    const { data: eventDetails } = await supabase
      .from('events')
      .select('title, start_date, location')
      .eq('id', eventId)
      .single()

    // 8. Send confirmation email
    try {
      const userName = `${profile.nombre} ${profile.apellido1}${profile.apellido2 ? ` ${profile.apellido2}` : ''}`
      const eventDate = new Date(eventDetails.start_date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      await EmailService.sendEventRegistrationConfirmation(
        profile.email,
        userName,
        eventDetails.title,
        eventDate,
        eventDetails.location || 'Por confirmar'
      )
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Registration created successfully',
      registration: {
        id: registration.id,
        status: registration.status,
        event: eventDetails
      }
    })

  } catch (error: unknown) {
    console.error('Error in event registration:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
