import { NextRequest, NextResponse } from 'next/server'
import { requireStaffOrAdmin } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireStaffOrAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Get last Sunday's attendance
    const { data: lastRecord, error: lastError } = await supabase
      .from('service_attendance')
      .select('*')
      .order('attendance_date', { ascending: false })
      .limit(1)
      .single()

    // Get total records count
    const { count: totalRecords, error: countError } = await supabase
      .from('service_attendance')
      .select('*', { count: 'exact', head: true })

    // Calculate average attendance (last 4 weeks)
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    
    const { data: recentRecords, error: recentError } = await supabase
      .from('service_attendance')
      .select('total_count')
      .gte('attendance_date', fourWeeksAgo.toISOString().split('T')[0])
      .order('attendance_date', { ascending: false })
      .limit(4)

    let averageAttendance = 0
    if (recentRecords && recentRecords.length > 0) {
      const sum = recentRecords.reduce((acc: number, record: any) => acc + (record.total_count || 0), 0)
      averageAttendance = Math.round(sum / recentRecords.length)
    }

    // Calculate growth (compare last 2 records)
    let growth = 0
    if (recentRecords && recentRecords.length >= 2) {
      const last = recentRecords[0]?.total_count || 0
      const previous = recentRecords[1]?.total_count || 0
      if (previous > 0) {
        growth = Math.round(((last - previous) / previous) * 100)
      } else if (last > 0) {
        growth = 100
      }
    }

    // Get highest attendance record
    const { data: highestRecord, error: highestError } = await supabase
      .from('service_attendance')
      .select('*')
      .order('total_count', { ascending: false })
      .limit(1)
      .single()

    if (lastError && lastError.code !== 'PGRST116') {
      console.error('Error fetching last record:', lastError)
    }
    if (countError) {
      console.error('Error fetching count:', countError)
    }
    if (recentError) {
      console.error('Error fetching recent records:', recentError)
    }
    if (highestError && highestError.code !== 'PGRST116') {
      console.error('Error fetching highest record:', highestError)
    }

    return NextResponse.json({
      success: true,
      stats: {
        lastRecord: lastRecord || null,
        totalRecords: totalRecords || 0,
        averageAttendance,
        growth,
        highestRecord: highestRecord || null
      }
    })

  } catch (error: unknown) {
    console.error('Error in attendance stats GET:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}



