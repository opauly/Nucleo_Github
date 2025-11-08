import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin, isSuperAdmin } from '@/lib/auth/role-auth'
import * as XLSX from 'xlsx'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
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

    // Get the requesting user's ID from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const userId = authHeader.replace('Bearer ', '')
    const isSuperAdminHeader = request.headers.get('x-super-admin') === 'true'

    // Check if user is admin or super admin
    const isUserAdmin = await isAdmin(userId)
    const isUserSuperAdmin = await isSuperAdmin(userId)

    if (!isUserAdmin && !isUserSuperAdmin && !isSuperAdminHeader) {
      // Check if user is team leader for any of the event's teams
      const { data: eventTeams, error: eventTeamsError } = await supabase
        .from('event_teams')
        .select('team_id')
        .eq('event_id', eventId)

      if (eventTeamsError || !eventTeams || eventTeams.length === 0) {
        return NextResponse.json(
          { error: 'Event not found or no teams associated' },
          { status: 404 }
        )
      }

      // Check if user is leader of any associated team using service role client
      let isAuthorized = false
      for (const eventTeam of eventTeams) {
        const { data: membership, error: membershipError } = await supabase
          .from('team_members')
          .select('team_leader, role')
          .eq('profile_id', userId)
          .eq('team_id', eventTeam.team_id)
          .eq('status', 'approved')
          .single()

        if (!membershipError && membership && (membership.team_leader === true || membership.role === 'lider')) {
          isAuthorized = true
          break
        }
      }

      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Access denied. You must be an admin or team leader for this event.' },
          { status: 403 }
        )
      }
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, start_date, location')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Fetch event attendees
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('id, status, notes, created_at, profile_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching attendees:', error)
      return NextResponse.json(
        { error: 'Error fetching attendees', details: error.message },
        { status: 500 }
      )
    }

    // Fetch profiles separately
    let profilesMap: Record<string, any> = {}
    if (registrations && registrations.length > 0) {
      const profileIds = registrations.map((r: any) => r.profile_id).filter(Boolean)
      
      if (profileIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nombre, apellido1, apellido2, email, phone')
          .in('id', profileIds)

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
          console.error('Profile IDs attempted:', profileIds)
        } else if (profiles) {
          console.log(`Successfully fetched ${profiles.length} profiles out of ${profileIds.length} requested`)
          profilesMap = profiles.reduce((acc: Record<string, any>, profile: any) => {
            acc[profile.id] = profile
            return acc
          }, {})
        } else {
          console.warn('No profiles returned from query')
        }
      }
    }

    // Helper function to translate status
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'approved':
          return 'Aprobado'
        case 'rejected':
          return 'Rechazado'
        case 'pending':
        default:
          return 'Pendiente'
      }
    }

    // Prepare data for Excel - include all registrations
    const excelData = (registrations || []).map((reg: any, index: number) => {
      const profile = profilesMap[reg.profile_id] || null
      if (!profile && reg.profile_id) {
        console.warn(`No profile found for registration ${reg.id} with profile_id ${reg.profile_id}`)
      }
      return {
        '#': index + 1,
        'Nombre': profile?.nombre || '',
        'Apellido 1': profile?.apellido1 || '',
        'Apellido 2': profile?.apellido2 || '',
        'Email': profile?.email || '',
        'Teléfono': profile?.phone || '',
        'Estado': getStatusLabel(reg.status || 'pending'),
        'Notas': reg.notes || '',
        'Fecha de Registro': reg.created_at ? new Date(reg.created_at).toLocaleString('es-ES') : ''
      }
    })

    // Create workbook
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 20 },  // Nombre
      { wch: 20 },  // Apellido 1
      { wch: 20 },  // Apellido 2
      { wch: 30 },  // Email
      { wch: 15 },  // Teléfono
      { wch: 15 },  // Estado
      { wch: 30 },  // Notas
      { wch: 25 }   // Fecha de Registro
    ]

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistentes')

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create filename
    const eventTitle = event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const filename = `asistentes_${eventTitle}_${new Date().toISOString().split('T')[0]}.xlsx`

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error: unknown) {
    console.error('Error in Excel export:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
