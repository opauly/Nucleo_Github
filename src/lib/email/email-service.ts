import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface EmailData {
  to: string
  subject: string
  html: string
}

export class EmailService {
  static async sendEmail(emailData: EmailData) {
    try {
      if (!resend) {
        console.log('Email service not configured - skipping email send')
        console.log('Email would have been sent:', {
          to: emailData.to,
          subject: emailData.subject
        })
        return { id: 'mock-email-id', message: 'Email service not configured' }
      }

      const { data, error } = await resend.emails.send({
        from: 'Núcleo <onboarding@resend.dev>',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
      })

      if (error) {
        console.error('Email sending failed:', error)
        throw new Error(`Failed to send email: ${error.message || error.error || 'Unknown error'}`)
      }

      console.log('Email sent successfully:', data)
      return data
    } catch (error) {
      console.error('Email service error:', error)
      throw error
    }
  }

  static async sendEventRegistrationConfirmation(
    userEmail: string,
    userName: string,
    eventName: string,
    eventDate: string,
    eventLocation: string
  ) {
    const subject = `Confirmación de Registro - ${eventName}`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Registro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Registro Confirmado!</h1>
            <p>Tu inscripción ha sido procesada exitosamente</p>
          </div>
          
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Te confirmamos que tu registro para el siguiente evento ha sido recibido y está siendo procesado:</p>
            
            <div class="event-details">
              <h3>📅 Detalles del Evento</h3>
              <p><strong>Evento:</strong> ${eventName}</p>
              <p><strong>Fecha:</strong> ${eventDate}</p>
              <p><strong>Ubicación:</strong> ${eventLocation}</p>
            </div>
            
            <p>Recibirás una notificación adicional una vez que tu registro sea aprobado por nuestro equipo.</p>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            
            <p>¡Gracias por ser parte de Núcleo!</p>
            
            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
              <p>© 2024 Núcleo. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to: userEmail, subject, html })
  }

  static async sendEventApprovalNotification(
    userEmail: string,
    userName: string,
    eventName: string,
    eventDate: string,
    eventLocation: string,
    isApproved: boolean
  ) {
    const status = isApproved ? 'Aprobado' : 'Rechazado'
    const subject = `Tu registro para "${eventName}" ha sido ${status}`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estado de Registro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${isApproved ? '#059669' : '#dc2626'} 0%, ${isApproved ? '#047857' : '#b91c1c'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isApproved ? '#059669' : '#dc2626'}; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '✅ Aprobado' : '❌ Rechazado'}</h1>
            <p>Tu registro ha sido ${status.toLowerCase()}</p>
          </div>
          
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Tu registro para el siguiente evento ha sido <strong>${status.toLowerCase()}</strong>:</p>
            
            <div class="event-details">
              <h3>📅 Detalles del Evento</h3>
              <p><strong>Evento:</strong> ${eventName}</p>
              <p><strong>Fecha:</strong> ${eventDate}</p>
              <p><strong>Ubicación:</strong> ${eventLocation}</p>
              <p><strong>Estado:</strong> <span style="color: ${isApproved ? '#059669' : '#dc2626'}; font-weight: bold;">${status}</span></p>
            </div>
            
            ${isApproved ? 
              '<p>¡Nos vemos en el evento! Recuerda llegar con tiempo y traer todo lo necesario.</p>' : 
              '<p>Si tienes alguna pregunta sobre esta decisión, por favor contacta a nuestro equipo.</p>'
            }
            
            <p>¡Gracias por tu interés en Núcleo!</p>
            
            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
              <p>© 2024 Núcleo. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to: userEmail, subject, html })
  }

  static async sendTeamMembershipConfirmation(
    userEmail: string,
    userName: string,
    teamName: string,
    teamDescription: string
  ) {
    const subject = `Solicitud de Membresía - ${teamName}`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Solicitud de Membresía</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .team-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤝 Solicitud Enviada</h1>
            <p>Tu solicitud de membresía ha sido recibida</p>
          </div>
          
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Te confirmamos que tu solicitud para unirte al siguiente equipo ha sido recibida:</p>
            
            <div class="team-details">
              <h3>👥 Detalles del Equipo</h3>
              <p><strong>Equipo:</strong> ${teamName}</p>
              <p><strong>Descripción:</strong> ${teamDescription}</p>
            </div>
            
            <p>Tu solicitud está siendo revisada por el líder del equipo. Recibirás una notificación una vez que sea procesada.</p>
            
            <p>¡Gracias por tu interés en servir en Núcleo!</p>
            
            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
              <p>© 2024 Núcleo. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to: userEmail, subject, html })
  }

  static async sendTeamApprovalNotification(
    userEmail: string,
    userName: string,
    teamName: string,
    isApproved: boolean
  ) {
    const status = isApproved ? 'Aprobada' : 'Rechazada'
    const subject = `Tu solicitud para "${teamName}" ha sido ${status}`
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estado de Membresía</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${isApproved ? '#059669' : '#dc2626'} 0%, ${isApproved ? '#047857' : '#b91c1c'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .team-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isApproved ? '#059669' : '#dc2626'}; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '✅ Aprobada' : '❌ Rechazada'}</h1>
            <p>Tu solicitud ha sido ${status.toLowerCase()}</p>
          </div>
          
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Tu solicitud para unirte al equipo ha sido <strong>${status.toLowerCase()}</strong>:</p>
            
            <div class="team-details">
              <h3>👥 Detalles del Equipo</h3>
              <p><strong>Equipo:</strong> ${teamName}</p>
              <p><strong>Estado:</strong> <span style="color: ${isApproved ? '#059669' : '#dc2626'}; font-weight: bold;">${status}</span></p>
            </div>
            
            ${isApproved ? 
              '<p>¡Bienvenido al equipo! El líder del equipo se pondrá en contacto contigo pronto con más detalles.</p>' : 
              '<p>Si tienes alguna pregunta sobre esta decisión, por favor contacta al líder del equipo.</p>'
            }
            
            <p>¡Gracias por tu interés en servir en Núcleo!</p>
            
            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
              <p>© 2024 Núcleo. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({ to: userEmail, subject, html })
  }
}
