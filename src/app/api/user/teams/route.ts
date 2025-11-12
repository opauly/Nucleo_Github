import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

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



