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
    const { registrationId, action, adminUserId } = await request.json()

    if (!registrationId || !action || !adminUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: registrationId, action, and adminUserId' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject', 'pending'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve", "reject", or "pending"' },
        { status: 400 }
      )
    }

    // 1. Check if admin user exists
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

    // Check if user is admin
    const isUserAdmin = adminProfile.role === 'Admin' || adminProfile.super_admin === true
    
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Admin access required to approve event registrations' },
        { status: 403 }
      )
    }

    // 2. Get the registration request with user and event details
    const { data: registration, error: registrationError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        profiles:profile_id (
          id,
          nombre,
          apellido1,
          apellido2,
          email
        ),
        events:event_id (
          id,
          title,
          start_date,
          location
        )
      `)
      .eq('id', registrationId)
      .single()

    if (registrationError || !registration) {
      return NextResponse.json(
        { error: 'Registration request not found' },
        { status: 404 }
      )
    }

    // 3. Update the registration status with the new enum values
    const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending'
    
    const { data: updatedRegistration, error: updateError } = await supabase
      .from('event_registrations')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', registrationId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating registration:', updateError)
      return NextResponse.json(
        { error: 'Failed to update registration status' },
        { status: 500 }
      )
    }

    // 4. Send approval/rejection email (only for approve/reject, not for pending)
    if (action !== 'pending') {
      try {
        const userName = `${registration.profiles.nombre} ${registration.profiles.apellido1}${registration.profiles.apellido2 ? ` ${registration.profiles.apellido2}` : ''}`
        const eventDate = new Date(registration.events.start_date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })

        await EmailService.sendEventApprovalNotification(
          registration.profiles.email,
          userName,
          registration.events.title,
          eventDate,
          registration.events.location || 'Por confirmar',
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
      'pending': 'set to pending'
    }
    
    return NextResponse.json({
      success: true,
      message: `Registration ${actionMessages[action] || 'updated'} successfully`,
      registration: updatedRegistration
    })

  } catch (error: unknown) {
    console.error('Error in registration approval:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
