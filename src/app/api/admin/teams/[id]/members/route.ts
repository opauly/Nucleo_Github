import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/auth/role-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teamId } = await params
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
    const profileIds = teamMembers.map(m => m.profile_id)

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
    const members = teamMembers.map(member => {
      const profile = profiles?.find(p => p.id === member.profile_id) || null
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

