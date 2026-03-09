import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/api-auth'
import * as XLSX from 'xlsx'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teamId } = await params
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Fetch team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('name')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Fetch team members
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select('profile_id, role, team_leader, status, joined_at')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true })

    if (membersError) {
      console.error('Error fetching team members:', membersError)
      return NextResponse.json(
        { error: 'Error fetching team members', details: membersError.message },
        { status: 500 }
      )
    }

    // Fetch profiles separately
    let profilesMap: Record<string, any> = {}
    if (teamMembers && teamMembers.length > 0) {
      const profileIds = teamMembers.map((m: any) => m.profile_id).filter(Boolean)
      
      if (profileIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nombre, apellido1, apellido2, email, phone, role')
          .in('id', profileIds)

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
        } else if (profiles) {
          profilesMap = profiles.reduce((acc: Record<string, any>, profile: any) => {
            acc[profile.id] = profile
            return acc
          }, {})
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

    // Helper function to translate role
    const getRoleLabel = (role: string) => {
      switch (role) {
        case 'lider':
          return 'Líder'
        case 'miembro':
        default:
          return 'Miembro'
      }
    }

    // Prepare data for Excel
    const excelData = (teamMembers || []).map((member: any, index: number) => {
      const profile = profilesMap[member.profile_id] || null
      return {
        '#': index + 1,
        'Nombre': profile?.nombre || '',
        'Apellido 1': profile?.apellido1 || '',
        'Apellido 2': profile?.apellido2 || '',
        'Email': profile?.email || '',
        'Teléfono': profile?.phone || '',
        'Rol': getRoleLabel(member.role || 'miembro'),
        'Es Líder': member.team_leader ? 'Sí' : 'No',
        'Estado': getStatusLabel(member.status || 'pending'),
        'Fecha de Ingreso': member.joined_at ? new Date(member.joined_at).toLocaleString('es-ES') : ''
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
      { wch: 15 },  // Rol
      { wch: 10 },  // Es Líder
      { wch: 15 },  // Estado
      { wch: 25 }   // Fecha de Ingreso
    ]

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Miembros')

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create filename
    const teamName = team.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const filename = `miembros_${teamName}_${new Date().toISOString().split('T')[0]}.xlsx`

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

