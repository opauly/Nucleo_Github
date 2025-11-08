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

    // First, let's check if the super_admin column exists
    const { data: profileColumns, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (checkError) {
      console.error('Error checking profiles table:', checkError)
      return NextResponse.json(
        { error: 'Error checking profiles table structure' },
        { status: 500 }
      )
    }

    // Check if super_admin column exists
    const hasSuperAdminColumn = profileColumns && profileColumns[0] && 'super_admin' in profileColumns[0]

    if (!hasSuperAdminColumn) {
      // Add super_admin column
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS super_admin BOOLEAN DEFAULT FALSE;'
      })

      if (alterError) {
        console.error('Error adding super_admin column:', alterError)
        return NextResponse.json(
          { error: 'Error adding super_admin column to profiles table' },
          { status: 500 }
        )
      }
    }

    // Set the initial super admin (opaulyc@gmail.com)
    const { data: superAdmin, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'Admin',
        super_admin: true 
      })
      .eq('email', 'opaulyc@gmail.com')
      .select()
      .single()

    if (updateError) {
      console.error('Error setting super admin:', updateError)
      return NextResponse.json(
        { error: 'Error setting super admin. Make sure the user with email opaulyc@gmail.com exists.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Super admin role added and initial super admin set successfully',
      superAdmin
    })

  } catch (error: unknown) {
    console.error('Error in add super admin role:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}




