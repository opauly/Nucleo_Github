import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user's event registrations
    const { data: eventRegistrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events (
          id,
          title,
          description,
          start_date,
          end_date,
          location,
          image_url,
          status,
          created_at
        )
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (registrationsError) {
      console.error('Error fetching event registrations:', registrationsError)
      return NextResponse.json({ error: 'Error al obtener registros de eventos' }, { status: 500 })
    }

    return NextResponse.json({ registrations: eventRegistrations || [] })

  } catch (error) {
    console.error('Error in user events API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
