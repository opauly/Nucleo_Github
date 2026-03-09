import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Get team details
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching team:', error)
      return NextResponse.json(
        { error: 'Error fetching team' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      team
    })

  } catch (error: unknown) {
    console.error('Error in get team:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    const teamData = await request.json()

    // Update team
    const { data: team, error } = await supabase
      .from('teams')
      .update({
        name: teamData.name,
        description: teamData.description,
        mission: teamData.mission,
        vision: teamData.vision,
        requirements: teamData.requirements,
        meeting_schedule: teamData.meeting_schedule,
        contact_person: teamData.contact_person,
        email_contacto: teamData.email_contacto,
        phone: teamData.phone,
        image_url: teamData.image_url,
        is_featured: teamData.is_featured,
        max_members: teamData.max_members,
        status: teamData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating team:', error)
      return NextResponse.json(
        { error: 'Error updating team' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Team updated successfully',
      team
    })

  } catch (error: unknown) {
    console.error('Error in update team:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Delete team
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting team:', error)
      return NextResponse.json(
        { error: 'Error deleting team' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    })

  } catch (error: unknown) {
    console.error('Error in delete team:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}





