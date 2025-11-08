import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { user, profileData } = await request.json()

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

    // Create profile using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          email: user.email,
          nombre: profileData.nombre,
          apellido1: profileData.apellido1,
          apellido2: profileData.apellido2 || null,
          phone: profileData.phone,
          birth_date: profileData.birth_date || null,
          provincia: profileData.provincia || 'San José',
          canton: profileData.canton || 'San José',
          distrito: profileData.distrito || 'Carmen',
          profile_picture_url: profileData.profile_picture_url || null,
          role: 'Miembro'
        }
      ])
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
