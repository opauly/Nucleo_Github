import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'
import { requireAdmin } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Get the request body
    const { registrationId, action } = await request.json()

    if (!registrationId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: registrationId and action' },
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
        const registrationProfile = Array.isArray((registration as any).profiles)
          ? (registration as any).profiles[0]
          : (registration as any).profiles
        const registrationEvent = Array.isArray((registration as any).events)
          ? (registration as any).events[0]
          : (registration as any).events

        if (!registrationProfile?.email || !registrationEvent?.title || !registrationEvent?.start_date) {
          throw new Error('Missing registration profile or event data for email notification')
        }

        const userName = `${registrationProfile.nombre || ''} ${registrationProfile.apellido1 || ''}${registrationProfile.apellido2 ? ` ${registrationProfile.apellido2}` : ''}`.trim()
        const eventDate = new Date(registrationEvent.start_date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })

        await EmailService.sendEventApprovalNotification(
          registrationProfile.email,
          userName,
          registrationEvent.title,
          eventDate,
          registrationEvent.location || 'Por confirmar',
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
