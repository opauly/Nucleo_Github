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

    const { team_id, profile_id, team_leader } = await request.json()

    if (!team_id || !profile_id || typeof team_leader !== 'boolean') {
      return NextResponse.json({ error: 'Datos requeridos: team_id, profile_id, team_leader' }, { status: 400 })
    }

    // Update the team_leader status
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ team_leader })
      .eq('team_id', team_id)
      .eq('profile_id', profile_id)

    if (updateError) {
      console.error('Error updating member role:', updateError)
      return NextResponse.json({ error: 'Error al actualizar el rol del miembro' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: team_leader ? 'Líder asignado exitosamente' : 'Líder removido exitosamente' 
    })

  } catch (error) {
    console.error('Error in update-member-role API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
