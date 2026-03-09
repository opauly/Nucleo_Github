import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin
    const userId = auth.userId
    const { team_id, profile_id } = await request.json()
    console.log('Remove member request:', { team_id, profile_id, user_id: userId })

    if (!team_id || !profile_id) {
      return NextResponse.json({ error: 'team_id y profile_id son requeridos' }, { status: 400 })
    }

    const isUserAdmin =
      auth.profile?.role === 'Admin' || auth.profile?.super_admin === true

    let isUserTeamLeader = false
    if (!isUserAdmin) {
      const { data: membership, error: membershipError } = await supabase
        .from('team_members')
        .select('team_leader, role')
        .eq('profile_id', userId)
        .eq('team_id', team_id)
        .eq('status', 'approved')
        .single()

      if (!membershipError && membership) {
        isUserTeamLeader =
          membership.team_leader === true || membership.role === 'lider'
      }
    }

    console.log('Permission check:', { isUserAdmin, isUserTeamLeader })

    if (!isUserAdmin && !isUserTeamLeader) {
      return NextResponse.json({ error: 'Acceso denegado. Se requieren permisos de administrador o líder de equipo.' }, { status: 403 })
    }

    // Remove the team member using service role (bypasses RLS)
    console.log('Attempting to delete team member:', { team_id, profile_id })
    const { error: removeError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', team_id)
      .eq('profile_id', profile_id)

    if (removeError) {
      console.error('Error removing team member:', removeError)
      return NextResponse.json({ error: 'Error al remover miembro del equipo' }, { status: 500 })
    }

    console.log('Team member removed successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Miembro removido exitosamente del equipo' 
    })

  } catch (error) {
    console.error('Error in remove-member API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
