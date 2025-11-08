import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin, isSuperAdmin, isTeamLeader } from '@/lib/auth/role-auth'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the requesting user's ID from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      console.log('No authorization header')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    const { team_id, profile_id } = await request.json()
    console.log('Remove member request:', { team_id, profile_id, user_id: userId })

    if (!team_id || !profile_id) {
      return NextResponse.json({ error: 'team_id y profile_id son requeridos' }, { status: 400 })
    }

    // Check if user is admin, super admin, or team leader
    const isUserAdmin = await isAdmin(userId)
    const isUserSuperAdmin = await isSuperAdmin(userId)
    const isUserTeamLeader = await isTeamLeader(userId, team_id)
    const isSuperAdminHeader = request.headers.get('X-Super-Admin') === 'true'

    console.log('Permission check:', { isUserAdmin, isUserSuperAdmin, isUserTeamLeader, isSuperAdminHeader })

    if (!isUserAdmin && !isUserSuperAdmin && !isUserTeamLeader && !isSuperAdminHeader) {
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
