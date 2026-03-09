import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'
import { requireUser } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Get the request body
    const { teamId, profileId, action } = await request.json()

    if (!teamId || !profileId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: teamId, profileId, and action' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject', 'pending'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve", "reject", or "pending"' },
        { status: 400 }
      )
    }

    const adminUserId = auth.userId
    const isUserAdmin =
      auth.profile?.role === 'Admin' || auth.profile?.super_admin === true

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
    const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending'
    
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

    // 5. Send approval/rejection email (only for approve/reject, not pending)
    if (action !== 'pending') {
      try {
        const membershipProfile = Array.isArray((membership as any).profiles)
          ? (membership as any).profiles[0]
          : (membership as any).profiles
        const membershipTeam = Array.isArray((membership as any).teams)
          ? (membership as any).teams[0]
          : (membership as any).teams

        if (!membershipProfile?.email || !membershipTeam?.name) {
          throw new Error('Missing membership profile or team data for email notification')
        }

        const userName = `${membershipProfile.nombre || ''} ${membershipProfile.apellido1 || ''}${membershipProfile.apellido2 ? ` ${membershipProfile.apellido2}` : ''}`.trim()

        await EmailService.sendTeamApprovalNotification(
          membershipProfile.email,
          userName,
          membershipTeam.name,
          action === 'approve'
        )
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
        // Don't fail the approval if email fails
      }
    }

    const actionMessages: Record<string, string> = {
      'approve': 'approved',
      'reject': 'rejected',
      'pending': 'marked as pending'
    }

    return NextResponse.json({
      success: true,
      message: `Membership ${actionMessages[action] || 'updated'} successfully`,
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
