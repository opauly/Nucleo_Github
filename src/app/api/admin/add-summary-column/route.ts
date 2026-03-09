import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Add summary column to announcements table
    const { error: announcementsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE announcements ADD COLUMN IF NOT EXISTS summary TEXT;'
    })

    if (announcementsError) {
      console.error('Error adding summary column to announcements:', announcementsError)
      return NextResponse.json(
        { error: 'Error adding summary column to announcements table' },
        { status: 500 }
      )
    }

    // Add summary column to devotionals table
    const { error: devotionalsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE devotionals ADD COLUMN IF NOT EXISTS summary TEXT;'
    })

    if (devotionalsError) {
      console.error('Error adding summary column to devotionals:', devotionalsError)
      return NextResponse.json(
        { error: 'Error adding summary column to devotionals table' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Summary columns added successfully to both tables'
    })

  } catch (error: unknown) {
    console.error('Error in adding summary columns:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}







