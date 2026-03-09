import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

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
