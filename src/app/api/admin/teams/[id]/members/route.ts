import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teamId } = await params
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Fetch team members with profiles
    // First, get all team members
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select('profile_id, role, team_leader, status, joined_at')
      .eq('team_id', teamId)

    if (membersError) {
      console.error('Error fetching team members:', membersError)
      return NextResponse.json(
        { error: 'Error fetching team members' },
        { status: 500 }
      )
    }

    if (!teamMembers || teamMembers.length === 0) {
      return NextResponse.json({
        success: true,
        members: []
      })
    }

    // Get all profile IDs
    const profileIds = teamMembers.map((m: any) => m.profile_id)

    // Fetch profiles separately
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nombre, apellido1, apellido2, email, phone, role')
      .in('id', profileIds)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json(
        { error: 'Error fetching profiles' },
        { status: 500 }
      )
    }

    // Combine team members with profiles
    const members = teamMembers.map((member: any) => {
      const profile = profiles?.find((p: any) => p.id === member.profile_id) || null
      return {
        ...member,
        profiles: profile
      }
    })

    return NextResponse.json({
      success: true,
      members: members || []
    })

  } catch (error: unknown) {
    console.error('Error in team members fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
