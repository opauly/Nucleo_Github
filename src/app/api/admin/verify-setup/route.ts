import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Check if super_admin column exists
    const { data: profileColumns, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profileError) {
      return NextResponse.json(
        { error: 'Error checking profiles table', details: profileError },
        { status: 500 }
      )
    }

    const hasSuperAdminColumn = profileColumns && profileColumns[0] && 'super_admin' in profileColumns[0]

    // Check if team_leader column exists
    const { data: teamMemberColumns, error: teamError } = await supabase
      .from('team_members')
      .select('*')
      .limit(1)

    if (teamError) {
      return NextResponse.json(
        { error: 'Error checking team_members table', details: teamError },
        { status: 500 }
      )
    }

    const hasTeamLeaderColumn = teamMemberColumns && teamMemberColumns[0] && 'team_leader' in teamMemberColumns[0]

    // Check if super admin user exists
    const { data: superAdmin, error: superAdminError } = await supabase
      .from('profiles')
      .select('id, email, role, super_admin')
      .eq('email', 'opaulyc@gmail.com')
      .single()

    return NextResponse.json({
      success: true,
      setup: {
        hasSuperAdminColumn,
        hasTeamLeaderColumn,
        superAdmin: superAdmin || null,
        superAdminError: superAdminError?.message || null
      }
    })

  } catch (error: unknown) {
    console.error('Error in verify setup:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}







