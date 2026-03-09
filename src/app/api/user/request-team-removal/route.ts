import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin
    const user = { id: auth.userId }

    const { team_id, reason } = await request.json()

    if (!team_id) {
      return NextResponse.json({ error: 'team_id es requerido' }, { status: 400 })
    }

    // Check if user is a member of this team
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', team_id)
      .eq('profile_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'No eres miembro de este equipo' }, { status: 404 })
    }

    // Update the membership status to 'removal_requested'
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ 
        status: 'removal_requested',
        message: reason || 'Solicitud de remoción del equipo'
      })
      .eq('team_id', team_id)
      .eq('profile_id', user.id)

    if (updateError) {
      console.error('Error requesting team removal:', updateError)
      return NextResponse.json({ error: 'Error al solicitar remoción del equipo' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Solicitud de remoción enviada exitosamente' 
    })

  } catch (error) {
    console.error('Error in request-team-removal API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}





