import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/auth/role-auth'
import puppeteer from 'puppeteer'

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
    const isSuperAdminHeader = request.headers.get('x-super-admin') === 'true'
    
    // Check if user is admin or super admin bypass
    if (!isSuperAdminHeader) {
      const adminStatus = await isAdmin(userId)
      if (!adminStatus) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
    }

    // Fetch team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('name, created_at')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Fetch team members
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select('profile_id, role, team_leader, status, joined_at')
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true })

    if (membersError) {
      console.error('Error fetching team members:', membersError)
      return NextResponse.json(
        { error: 'Error fetching team members', details: membersError.message },
        { status: 500 }
      )
    }

    // Fetch profiles separately
    let profilesMap: Record<string, any> = {}
    if (teamMembers && teamMembers.length > 0) {
      const profileIds = teamMembers.map((m: any) => m.profile_id).filter(Boolean)
      
      if (profileIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nombre, apellido1, apellido2, email, phone, role')
          .in('id', profileIds)

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
        } else if (profiles) {
          profilesMap = profiles.reduce((acc: Record<string, any>, profile: any) => {
            acc[profile.id] = profile
            return acc
          }, {})
        }
      }
    }

    // Helper function to translate status
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

    // Helper function to translate role
    const getRoleLabel = (role: string) => {
      switch (role) {
        case 'lider':
          return 'Líder'
        case 'miembro':
        default:
          return 'Miembro'
      }
    }

    // Generate PDF HTML content
    const members = teamMembers || []
    const totalMembers = members.length
    const teamCreatedDate = new Date(team.created_at).toLocaleDateString('es-ES', {
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
            .team-info {
              background-color: #f8fafc;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .team-info p {
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
          <h1>Lista de Miembros</h1>
          <div class="team-info">
            <p><strong>Equipo:</strong> ${team.name}</p>
            <p><strong>Creado:</strong> ${teamCreatedDate}</p>
            <p><strong>Total de miembros:</strong> ${totalMembers}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Es Líder</th>
                <th>Estado</th>
                <th>Fecha de Ingreso</th>
              </tr>
            </thead>
            <tbody>
              ${(teamMembers || []).map((member: any, index: number) => {
                const profile = profilesMap[member.profile_id] || null
                return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${profile?.nombre || ''}</td>
                  <td>${[profile?.apellido1, profile?.apellido2].filter(Boolean).join(' ') || ''}</td>
                  <td>${profile?.email || ''}</td>
                  <td>${profile?.phone || ''}</td>
                  <td>${getRoleLabel(member.role || 'miembro')}</td>
                  <td>${member.team_leader ? 'Sí' : 'No'}</td>
                  <td>${getStatusLabel(member.status || 'pending')}</td>
                  <td>${member.joined_at ? new Date(member.joined_at).toLocaleString('es-ES') : ''}</td>
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
      const teamName = team.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      const filename = `miembros_${teamName}_${new Date().toISOString().split('T')[0]}.pdf`

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
          'Content-Disposition': `attachment; filename="miembros_${team.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.html"`
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

