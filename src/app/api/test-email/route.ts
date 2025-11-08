import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'event-registration':
        result = await EmailService.sendEventRegistrationConfirmation(
          email,
          'Usuario de Prueba',
          'Evento de Prueba',
          'Viernes, 15 de diciembre de 2024 a las 19:00',
          'Sede Principal de Núcleo'
        )
        break

      case 'event-approval':
        result = await EmailService.sendEventApprovalNotification(
          email,
          'Usuario de Prueba',
          'Evento de Prueba',
          'Viernes, 15 de diciembre de 2024 a las 19:00',
          'Sede Principal de Núcleo',
          true
        )
        break

      case 'event-rejection':
        result = await EmailService.sendEventApprovalNotification(
          email,
          'Usuario de Prueba',
          'Evento de Prueba',
          'Viernes, 15 de diciembre de 2024 a las 19:00',
          'Sede Principal de Núcleo',
          false
        )
        break

      case 'team-membership':
        result = await EmailService.sendTeamMembershipConfirmation(
          email,
          'Usuario de Prueba',
          'Equipo de Prueba',
          'Este es un equipo de prueba para verificar el sistema de emails.'
        )
        break

      case 'team-approval':
        result = await EmailService.sendTeamApprovalNotification(
          email,
          'Usuario de Prueba',
          'Equipo de Prueba',
          true
        )
        break

      case 'team-rejection':
        result = await EmailService.sendTeamApprovalNotification(
          email,
          'Usuario de Prueba',
          'Equipo de Prueba',
          false
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Must be one of: event-registration, event-approval, event-rejection, team-membership, team-approval, team-rejection' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      result
    })

  } catch (error: unknown) {
    console.error('Error sending test email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}




