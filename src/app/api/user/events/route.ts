import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin
    const user = { id: auth.userId }

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
          is_recurring,
          recurrence_type,
          recurrence_pattern,
          recurrence_days,
          recurrence_dates,
          recurrence_end_date,
          recurrence_start_date,
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
