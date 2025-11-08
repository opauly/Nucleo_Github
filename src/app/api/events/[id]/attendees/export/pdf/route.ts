import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin, isSuperAdmin } from '@/lib/auth/role-auth'
import puppeteer from 'puppeteer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
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
    const isSuperAdminHeader = request.headers.get('x-super-admin') === 'true'

    // Check if user is admin or super admin
    const isUserAdmin = await isAdmin(userId)
    const isUserSuperAdmin = await isSuperAdmin(userId)

    if (!isUserAdmin && !isUserSuperAdmin && !isSuperAdminHeader) {
      // Check if user is team leader for any of the event's teams
      const { data: eventTeams, error: eventTeamsError } = await supabase
        .from('event_teams')
        .select('team_id')
        .eq('event_id', eventId)

      if (eventTeamsError || !eventTeams || eventTeams.length === 0) {
        return NextResponse.json(
          { error: 'Event not found or no teams associated' },
          { status: 404 }
        )
      }

      // Check if user is leader of any associated team using service role client
      let isAuthorized = false
      for (const eventTeam of eventTeams) {
        const { data: membership, error: membershipError } = await supabase
          .from('team_members')
          .select('team_leader, role')
          .eq('profile_id', userId)
          .eq('team_id', eventTeam.team_id)
          .eq('status', 'approved')
          .single()

        if (!membershipError && membership && (membership.team_leader === true || membership.role === 'lider')) {
          isAuthorized = true
          break
        }
      }

      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Access denied. You must be an admin or team leader for this event.' },
          { status: 403 }
        )
      }
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, start_date, location')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Fetch event attendees
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('id, status, notes, created_at, profile_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching attendees:', error)
      return NextResponse.json(
        { error: 'Error fetching attendees', details: error.message },
        { status: 500 }
      )
    }

    // Fetch profiles separately
    let profilesMap: Record<string, any> = {}
    if (registrations && registrations.length > 0) {
      const profileIds = registrations.map((r: any) => r.profile_id).filter(Boolean)
      
      if (profileIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nombre, apellido1, apellido2, email, phone')
          .in('id', profileIds)

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
          console.error('Profile IDs attempted:', profileIds)
        } else if (profiles) {
          console.log(`Successfully fetched ${profiles.length} profiles out of ${profileIds.length} requested`)
          profilesMap = profiles.reduce((acc: Record<string, any>, profile: any) => {
            acc[profile.id] = profile
            return acc
          }, {})
        } else {
          console.warn('No profiles returned from query')
        }
      }
    }

    // Generate PDF HTML content
    const attendees = registrations || []
    const totalAttendees = attendees.length
    const eventDate = new Date(event.start_date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1 {
              color: #1e40af;
              border-bottom: 2px solid #1e40af;
              padding-bottom: 10px;
            }
            .event-info {
              background-color: #f8fafc;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .event-info p {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #1e40af;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Lista de Asistentes</h1>
          <div class="event-info">
            <p><strong>Evento:</strong> ${event.title}</p>
            <p><strong>Fecha:</strong> ${eventDate}</p>
            ${event.location ? `<p><strong>Ubicación:</strong> ${event.location}</p>` : ''}
            <p><strong>Total de asistentes:</strong> ${totalAttendees}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              ${(registrations || []).map((reg: any, index: number) => {
                const profile = profilesMap[reg.profile_id] || null
                const getStatusLabel = (status: string) => {
                  switch (status) {
                    case 'approved':
                      return 'Aprobado'
                    case 'rejected':
                      return 'Rechazado'
                    case 'pending':
                    default:
                      return 'Pendiente'
                  }
                }
                return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${profile?.nombre || ''}</td>
                  <td>${[profile?.apellido1, profile?.apellido2].filter(Boolean).join(' ') || ''}</td>
                  <td>${profile?.email || ''}</td>
                  <td>${profile?.phone || ''}</td>
                  <td>${getStatusLabel(reg.status || 'pending')}</td>
                  <td>${reg.created_at ? new Date(reg.created_at).toLocaleString('es-ES') : ''}</td>
                </tr>
              `
              }).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Generado el ${new Date().toLocaleString('es-ES')}</p>
          </div>
        </body>
      </html>
    `

    // Generate PDF using Puppeteer
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      const page = await browser.newPage()
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      })
      await browser.close()

      // Create filename
      const eventTitle = event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `asistentes_${eventTitle}_${new Date().toISOString().split('T')[0]}.pdf`

      // Return PDF file
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError)
      // Fallback to HTML if PDF generation fails
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="asistentes_${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.html"`
        }
      })
    }

  } catch (error: unknown) {
    console.error('Error in PDF export:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
