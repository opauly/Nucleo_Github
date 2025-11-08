import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { event_id, reason } = await request.json()

    if (!event_id) {
      return NextResponse.json({ error: 'event_id es requerido' }, { status: 400 })
    }

    // Check if user is registered for this event
    const { data: registration, error: registrationError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', event_id)
      .eq('profile_id', user.id)
      .single()

    if (registrationError || !registration) {
      return NextResponse.json({ error: 'No estás registrado para este evento' }, { status: 404 })
    }

    // Update the registration status to 'rejected' (cancelled by user)
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({ 
        status: 'rejected',
        notes: reason || 'Solicitud de cancelación del evento'
      })
      .eq('event_id', event_id)
      .eq('profile_id', user.id)

    if (updateError) {
      console.error('Error requesting event removal:', updateError)
      return NextResponse.json({ error: 'Error al solicitar cancelación del evento' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Solicitud de cancelación enviada exitosamente' 
    })

  } catch (error) {
    console.error('Error in request-event-removal API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
