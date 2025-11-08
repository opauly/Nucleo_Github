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
    const { teamId, profileId, action, adminUserId } = await request.json()

    if (!teamId || !profileId || !action || !adminUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: teamId, profileId, action, and adminUserId' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // 1. Check if admin user exists and has appropriate role
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminUserId)
      .single()

    if (adminError || !adminProfile) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Check if user is admin or team leader
    const isUserAdmin = adminProfile.role === 'Admin' || adminProfile.super_admin === true
    
    if (!isUserAdmin) {
      // Check if user is team leader for this specific team
      const { data: teamMembership, error: membershipError } = await supabase
        .from('team_members')
        .select('team_leader, role')
        .eq('profile_id', adminUserId)
        .eq('team_id', teamId)
        .eq('status', 'approved')
        .single()

      if (membershipError || !teamMembership || (!teamMembership.team_leader && teamMembership.role !== 'lider')) {
        return NextResponse.json(
          { error: 'Admin or team leader access required' },
          { status: 403 }
        )
      }
    }

    // 2. Get the membership request
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles:profile_id(
          id,
          nombre,
          apellido1,
          apellido2,
          email
        ),
        teams:team_id(
          id,
          name,
          description
        )
      `)
      .eq('team_id', teamId)
      .eq('profile_id', profileId)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membership request not found' },
        { status: 404 }
      )
    }

    // 3. Update the membership status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    
    const { data: updatedMembership, error: updateError } = await supabase
      .from('team_members')
      .update({
        status: newStatus,
        approved_at: action === 'approve' ? new Date().toISOString() : null,
        approved_by: action === 'approve' ? adminUserId : null
      })
      .eq('team_id', teamId)
      .eq('profile_id', profileId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating membership:', updateError)
      return NextResponse.json(
        { error: 'Failed to update membership status' },
        { status: 500 }
      )
    }

    // 4. If approved, update user role to 'Staff'
    if (action === 'approve') {
      const { error: roleUpdateError } = await supabase
        .from('profiles')
        .update({ role: 'Staff' })
        .eq('id', membership.profile_id)

      if (roleUpdateError) {
        console.error('Error updating user role:', roleUpdateError)
        // Don't fail the whole request if role update fails
      }
    }

    // 5. Send approval/rejection email
    try {
      const userName = `${membership.profiles.nombre} ${membership.profiles.apellido1}${membership.profiles.apellido2 ? ` ${membership.profiles.apellido2}` : ''}`

      await EmailService.sendTeamApprovalNotification(
        membership.profiles.email,
        userName,
        membership.teams.name,
        action === 'approve'
      )
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Membership ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      membership: updatedMembership
    })

  } catch (error: unknown) {
    console.error('Error in membership approval:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
