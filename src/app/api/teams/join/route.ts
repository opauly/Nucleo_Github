import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { EmailService } from '@/lib/email/email-service'

export async function POST(request: NextRequest) {
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

    // Get the request body
    const { teamId, userId, message } = await request.json()

    if (!teamId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: teamId and userId' },
        { status: 400 }
      )
    }

    // 1. Check if user exists and is a member
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // 2. Check if team exists
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // 3. Check if user is already a member of this team
    const { data: existingMembership, error: existingError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('profile_id', userId)
      .single()

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      )
    }

    // 4. Create the team membership request
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: teamId,
          profile_id: userId,
          status: 'pending',
          message: message || null,
          joined_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (membershipError) {
      console.error('Error creating team membership:', membershipError)
      return NextResponse.json(
        { error: 'Failed to create team membership request' },
        { status: 500 }
      )
    }

    // 5. Send confirmation email
    try {
      const userName = `${profile.nombre} ${profile.apellido1}${profile.apellido2 ? ` ${profile.apellido2}` : ''}`

      await EmailService.sendTeamMembershipConfirmation(
        profile.email,
        userName,
        team.name,
        team.description || 'Sin descripción disponible'
      )
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the membership request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Team membership request created successfully',
      membership: {
        id: membership.id,
        status: membership.status,
        team: {
          id: team.id,
          name: team.name
        }
      }
    })

  } catch (error: unknown) {
    console.error('Error in team membership request:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
