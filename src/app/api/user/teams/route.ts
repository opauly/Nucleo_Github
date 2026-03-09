import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin
    const user = { id: auth.userId }

    // Get user's team memberships
    const { data: teamMemberships, error: membershipsError } = await supabase
      .from('team_members')
      .select(`
        *,
        teams (
          id,
          name,
          description,
          image_url,
          status,
          created_at
        )
      `)
      .eq('profile_id', user.id)
      .order('joined_at', { ascending: false })

    if (membershipsError) {
      console.error('Error fetching team memberships:', membershipsError)
      return NextResponse.json({ error: 'Error al obtener membresías de equipos' }, { status: 500 })
    }

    return NextResponse.json({ memberships: teamMemberships || [] })

  } catch (error) {
    console.error('Error in user teams API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}





