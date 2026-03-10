import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Get all teams with their members
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        description,
        email_contacto,
        mission,
        vision,
        requirements,
        meeting_schedule,
        contact_person,
        phone,
        image_url,
        is_featured,
        max_members,
        status,
        created_at,
        updated_at,
        team_members (
          profile_id,
          role,
          team_leader,
          status,
          joined_at,
          profiles (
            id,
            nombre,
            apellido1,
            apellido2,
            email,
            role
          )
        )
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching teams:', error)
      return NextResponse.json(
        { error: 'Error fetching teams' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      teams: teams || []
    })

  } catch (error: unknown) {
    console.error('Error in teams fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    const { teamId, memberId, teamLeader, role } = await request.json()

    if (!teamId || !memberId) {
      return NextResponse.json(
        { error: 'Missing required fields: teamId and memberId' },
        { status: 400 }
      )
    }

    // Update team member role and leader status
    const updateData: any = {}
    if (teamLeader !== undefined) {
      updateData.team_leader = teamLeader
    }
    if (role) {
      updateData.role = role
    }

    const { data: updatedMembership, error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('team_id', teamId)
      .eq('profile_id', memberId)
      .select()
      .single()

    if (error) {
      console.error('Error updating team member:', error)
      return NextResponse.json(
        { error: 'Error updating team member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully',
      membership: updatedMembership
    })

  } catch (error: unknown) {
    console.error('Error in team member update:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
