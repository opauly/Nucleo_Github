import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    const { profileData } = await request.json()

    // Create profile using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        [
          {
            id: auth.userId,
            email: auth.userEmail,
            nombre: profileData.nombre,
            apellido1: profileData.apellido1,
            apellido2: profileData.apellido2 || null,
            phone: profileData.phone,
            birth_date: profileData.birth_date || null,
            provincia: profileData.provincia || 'San José',
            canton: profileData.canton || 'San José',
            distrito: profileData.distrito || 'Carmen',
            profile_picture_url: profileData.profile_picture_url || null,
            role: 'Miembro',
            email_subscribe_announcements:
              profileData.email_subscribe_announcements ?? true,
            email_subscribe_events: profileData.email_subscribe_events ?? true,
            email_subscribe_devotionals:
              profileData.email_subscribe_devotionals ?? true
          }
        ],
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, profile: data })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Unexpected error during profile creation' },
      { status: 500 }
    )
  }
}
