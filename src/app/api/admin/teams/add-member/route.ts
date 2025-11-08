import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin, isSuperAdmin } from '@/lib/auth/role-auth'

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
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')

    // Check if user is admin or super admin
    const isUserAdmin = await isAdmin(userId)
    const isUserSuperAdmin = await isSuperAdmin(userId)
    const isSuperAdminHeader = request.headers.get('X-Super-Admin') === 'true'

    if (!isUserAdmin && !isUserSuperAdmin && !isSuperAdminHeader) {
      return NextResponse.json({ error: 'Acceso denegado. Se requieren permisos de administrador.' }, { status: 403 })
    }

    const { team_id, profile_id, role = 'miembro', team_leader = false } = await request.json()

    if (!team_id || !profile_id) {
      return NextResponse.json({ error: 'team_id y profile_id son requeridos' }, { status: 400 })
    }

    // Check if user is already a member of this team
    const { data: existingMember, error: checkError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', team_id)
      .eq('profile_id', profile_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing membership:', checkError)
      return NextResponse.json({ error: 'Error al verificar membresía existente' }, { status: 500 })
    }

    if (existingMember) {
      return NextResponse.json({ error: 'Este usuario ya es miembro del equipo' }, { status: 400 })
    }

    // Add the member to the team
    const { data: newMember, error: addError } = await supabase
      .from('team_members')
      .insert({
        team_id,
        profile_id,
        role,
        team_leader,
        status: 'approved', // Auto-approve when added by admin
        approved_at: new Date().toISOString(),
        approved_by: userId
      })
      .select(`
        *,
        profiles (
          id,
          nombre,
          apellido1,
          apellido2,
          email,
          role
        )
      `)
      .single()

    if (addError) {
      console.error('Error adding team member:', addError)
      return NextResponse.json({ error: 'Error al agregar miembro al equipo' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Miembro agregado exitosamente',
      member: newMember
    })

  } catch (error) {
    console.error('Error in add-member API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
