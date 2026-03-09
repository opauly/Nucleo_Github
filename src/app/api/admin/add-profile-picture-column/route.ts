import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Add profile_picture_url column to profiles table
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;'
    })

    if (error) {
      console.error('Error adding profile_picture_url column:', error)
      return NextResponse.json(
        { error: 'Error adding profile_picture_url column to profiles table' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture URL column added successfully'
    })

  } catch (error: unknown) {
    console.error('Error in add profile picture column:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}







