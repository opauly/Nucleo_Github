import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { 
      email_subscribe_announcements, 
      email_subscribe_events, 
      email_subscribe_devotionals 
    } = await request.json()

    // Validate that at least one preference is provided
    if (
      email_subscribe_announcements === undefined &&
      email_subscribe_events === undefined &&
      email_subscribe_devotionals === undefined
    ) {
      return NextResponse.json(
        { error: 'Al menos una preferencia debe ser proporcionada' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (email_subscribe_announcements !== undefined) {
      updateData.email_subscribe_announcements = email_subscribe_announcements
    }
    if (email_subscribe_events !== undefined) {
      updateData.email_subscribe_events = email_subscribe_events
    }
    if (email_subscribe_devotionals !== undefined) {
      updateData.email_subscribe_devotionals = email_subscribe_devotionals
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating email preferences:', error)
      return NextResponse.json(
        { error: 'Error al actualizar preferencias de email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Preferencias de email actualizadas exitosamente',
      profile: data
    })

  } catch (error) {
    console.error('Error in email preferences update:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

