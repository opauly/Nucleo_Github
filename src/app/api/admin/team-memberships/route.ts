import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Get all team memberships with user profile and team data
    const { data: memberships, error } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles:profile_id (
          id,
          nombre,
          apellido1,
          apellido2,
          email
        ),
        teams:team_id (
          id,
          name,
          description
        )
      `)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Error fetching team memberships:', error)
      return NextResponse.json(
        { error: 'Error fetching team memberships' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      memberships: memberships || []
    })

  } catch (error: unknown) {
    console.error('Error in team memberships fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
