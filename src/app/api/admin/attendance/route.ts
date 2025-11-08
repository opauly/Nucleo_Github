import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isStaffOrAbove, isAdmin } from '@/lib/auth/role-auth'

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

    const { attendance_date, adults_count, teens_count, kids_count, notes } = await request.json()

    // Get the requesting user's ID from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const userId = authHeader.replace('Bearer ', '')
    const superAdminBypass = request.headers.get('x-super-admin') === 'true'
    
    // Check if user is Staff or above
    if (!superAdminBypass) {
      const staffStatus = await isStaffOrAbove(userId)
      if (!staffStatus) {
        return NextResponse.json(
          { error: 'Staff access required to record attendance' },
          { status: 403 }
        )
      }
    }

    // Validate required fields
    if (!attendance_date) {
      return NextResponse.json(
        { error: 'attendance_date is required' },
        { status: 400 }
      )
    }

    // Validate counts
    const adults = parseInt(adults_count) || 0
    const teens = parseInt(teens_count) || 0
    const kids = parseInt(kids_count) || 0

    if (adults < 0 || teens < 0 || kids < 0) {
      return NextResponse.json(
        { error: 'Counts must be non-negative integers' },
        { status: 400 }
      )
    }

    // Check if record already exists for this date
    const { data: existingRecord } = await supabase
      .from('service_attendance')
      .select('id')
      .eq('attendance_date', attendance_date)
      .single()

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Attendance record already exists for this date. Use update instead.' },
        { status: 409 }
      )
    }

    // Insert new record
    const { data: newRecord, error } = await supabase
      .from('service_attendance')
      .insert({
        attendance_date,
        adults_count: adults,
        teens_count: teens,
        kids_count: kids,
        recorded_by: userId,
        notes: notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating attendance record:', error)
      return NextResponse.json(
        { error: 'Error creating attendance record', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance record created successfully',
      record: newRecord
    })

  } catch (error: unknown) {
    console.error('Error in attendance POST:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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
    const superAdminBypass = request.headers.get('x-super-admin') === 'true'
    
    // Check if user is Staff or above
    if (!superAdminBypass) {
      const staffStatus = await isStaffOrAbove(userId)
      if (!staffStatus) {
        return NextResponse.json(
          { error: 'Staff access required to view attendance' },
          { status: 403 }
        )
      }
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build query
    let query = supabase
      .from('service_attendance')
      .select(`
        id,
        attendance_date,
        adults_count,
        teens_count,
        kids_count,
        total_count,
        recorded_by,
        notes,
        created_at,
        updated_at,
        profiles:recorded_by (
          id,
          nombre,
          apellido1,
          email
        )
      `)
      .order('attendance_date', { ascending: false })
      .limit(limit)

    if (startDate) {
      query = query.gte('attendance_date', startDate)
    }
    if (endDate) {
      query = query.lte('attendance_date', endDate)
    }

    const { data: records, error } = await query

    if (error) {
      console.error('Error fetching attendance records:', error)
      return NextResponse.json(
        { error: 'Error fetching attendance records', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      records: records || []
    })

  } catch (error: unknown) {
    console.error('Error in attendance GET:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

