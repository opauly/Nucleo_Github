import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { email, profileData } = await request.json()

    if (!email || !profileData) {
      return NextResponse.json(
        { error: 'Missing required fields: email and profileData' },
        { status: 400 }
      )
    }

    // Get admin user from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const adminUserId = authHeader.replace('Bearer ', '')
    const isSuperAdmin = request.headers.get('X-Super-Admin') === 'true'

    // Check if admin user exists and has appropriate role
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

    // Check if user is admin or super admin
    const isUserAdmin = adminProfile.role === 'Admin' || adminProfile.super_admin === true || isSuperAdmin

    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

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
          role: 'Miembro'
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

