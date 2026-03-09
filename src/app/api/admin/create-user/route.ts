import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Get the request body
    const { email, profileData } = await request.json()

    if (!email || !profileData) {
      return NextResponse.json(
        { error: 'Missing required fields: email and profileData' },
        { status: 400 }
      )
    }

    const adminUserId = auth.userId

    // Profile picture URL is already provided in profileData if uploaded
    const profilePictureUrl = profileData.profile_picture_url || null

    // 2. Invite user by email (this sends an invitation email with password setup link)
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        nombre: profileData.nombre,
        apellido1: profileData.apellido1,
        apellido2: profileData.apellido2 || null
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: authError.message || 'Error creating user account' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // 3. Create profile using service role (bypasses RLS)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: email,
          nombre: profileData.nombre,
          apellido1: profileData.apellido1,
          apellido2: profileData.apellido2 || null,
          phone: profileData.phone,
          birth_date: profileData.birth_date || null,
          provincia: profileData.provincia || 'San José',
          canton: profileData.canton || 'San José',
          distrito: profileData.distrito || 'Carmen',
          profile_picture_url: profilePictureUrl,
          role: 'Miembro',
          email_subscribe_announcements: profileData.email_subscribe_announcements ?? true,
          email_subscribe_events: profileData.email_subscribe_events ?? true,
          email_subscribe_devotionals: profileData.email_subscribe_devotionals ?? true
        }
      ])
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Try to delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: profileError.message || 'Error creating user profile' },
        { status: 500 }
      )
    }

    // 4. Invitation email is automatically sent by Supabase when using inviteUserByEmail
    // The user will receive an email with a link to set their password and activate their account

    return NextResponse.json({
      success: true,
      message: 'User created successfully. Invitation email has been sent.',
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      profile: profile
    })

  } catch (error: unknown) {
    console.error('Error in create-user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

