import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/auth/role-auth'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the requesting user's ID from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const userId = authHeader.replace('Bearer ', '')
    
    // Check if user is admin or super admin bypass
    const superAdminBypass = request.headers.get('x-super-admin') === 'true'
    if (!superAdminBypass) {
      const adminStatus = await isAdmin(userId)
      if (!adminStatus) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
    }

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

    // Debug: Log the teams data to see what's being returned
    console.log('Teams fetched:', teams?.length || 0, 'teams')
    if (teams && teams.length > 0) {
      const musiciansTeam = teams.find(t => t.name === 'Músicos')
      if (musiciansTeam) {
        console.log('Músicos team members:', musiciansTeam.team_members?.length || 0, 'members')
        if (musiciansTeam.team_members) {
          musiciansTeam.team_members.forEach(member => {
            console.log('Member:', member.profiles?.email, 'Status:', member.status)
          })
        }
      }
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { userId, teamId, memberId, teamLeader, role } = await request.json()

    if (!userId || !teamId || !memberId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, teamId, and memberId' },
        { status: 400 }
      )
    }

    // Check if requesting user is admin or super admin bypass
    const superAdminBypass = request.headers.get('x-super-admin') === 'true'
    if (!superAdminBypass) {
      const adminStatus = await isAdmin(userId)
      if (!adminStatus) {
        return NextResponse.json(
          { error: 'Admin access required to manage team members' },
          { status: 403 }
        )
      }
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
