import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/auth/role-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
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
    
    // Check if user is Admin or above (only admins can update)
    if (!superAdminBypass) {
      const adminStatus = await isAdmin(userId)
      if (!adminStatus) {
        return NextResponse.json(
          { error: 'Admin access required to update attendance records' },
          { status: 403 }
        )
      }
    }

    // Validate counts if provided
    if (adults_count !== undefined) {
      const adults = parseInt(adults_count)
      if (isNaN(adults) || adults < 0) {
        return NextResponse.json(
          { error: 'adults_count must be a non-negative integer' },
          { status: 400 }
        )
      }
    }

    if (teens_count !== undefined) {
      const teens = parseInt(teens_count)
      if (isNaN(teens) || teens < 0) {
        return NextResponse.json(
          { error: 'teens_count must be a non-negative integer' },
          { status: 400 }
        )
      }
    }

    if (kids_count !== undefined) {
      const kids = parseInt(kids_count)
      if (isNaN(kids) || kids < 0) {
        return NextResponse.json(
          { error: 'kids_count must be a non-negative integer' },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: any = {}
    if (attendance_date) updateData.attendance_date = attendance_date
    if (adults_count !== undefined) updateData.adults_count = parseInt(adults_count)
    if (teens_count !== undefined) updateData.teens_count = parseInt(teens_count)
    if (kids_count !== undefined) updateData.kids_count = parseInt(kids_count)
    if (notes !== undefined) updateData.notes = notes || null

    // Update record
    const { data: updatedRecord, error } = await supabase
      .from('service_attendance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating attendance record:', error)
      return NextResponse.json(
        { error: 'Error updating attendance record', details: error.message },
        { status: 500 }
      )
    }

    if (!updatedRecord) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance record updated successfully',
      record: updatedRecord
    })

  } catch (error: unknown) {
    console.error('Error in attendance PUT:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

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
    
    // Check if user is Admin or above (only admins can delete)
    if (!superAdminBypass) {
      const adminStatus = await isAdmin(userId)
      if (!adminStatus) {
        return NextResponse.json(
          { error: 'Admin access required to delete attendance records' },
          { status: 403 }
        )
      }
    }

    // Delete record
    const { error } = await supabase
      .from('service_attendance')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting attendance record:', error)
      return NextResponse.json(
        { error: 'Error deleting attendance record', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully'
    })

  } catch (error: unknown) {
    console.error('Error in attendance DELETE:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

