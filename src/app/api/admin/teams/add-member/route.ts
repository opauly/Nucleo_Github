import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin
    const userId = auth.userId

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
