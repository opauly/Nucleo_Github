import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/auth/role-auth'

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
    
    // Check if user is Admin or above
    if (!superAdminBypass) {
      const adminStatus = await isAdmin(userId)
      if (!adminStatus) {
        return NextResponse.json(
          { error: 'Admin access required to import attendance data' },
          { status: 403 }
        )
      }
    }

    // Get CSV content and override option from form data
    const formData = await request.formData()
    const csvContent = formData.get('csvContent') as string
    const overrideExistingStr = formData.get('overrideExisting') as string
    const overrideExisting = overrideExistingStr === 'true'

    if (!csvContent) {
      return NextResponse.json(
        { error: 'CSV content is required' },
        { status: 400 }
      )
    }

    const content = csvContent
    const lines = content.split('\n').filter(line => line.trim())
    
    // Skip header lines (first 2 lines)
    const dataLines = lines.slice(2)
    
    const records = []
    
    for (const line of dataLines) {
      if (!line.trim()) continue
      
      // Parse CSV line
      const values = line.split(',').map(v => v.trim())
      
      if (values.length < 2) continue
      
      const fecha = values[0].trim()
      const adultos = parseInt(values[1]) || 0
      const ninos = parseInt(values[2]) || 0
      const personasNuevas = parseInt(values[3]) || 0
      const bebes = parseInt(values[4]) || 0
      const teens = parseInt(values[5]) || 0
      
      // Skip if no date
      if (!fecha) continue
      
      // Convert date from DD/MM/YY or DD/MM/YYYY to YYYY-MM-DD
      let attendanceDate: string
      try {
        const dateParts = fecha.split('/')
        
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0])
          const month = parseInt(dateParts[1])
          let year = parseInt(dateParts[2])
          
          // Handle 2-digit year (assume 20xx for years < 50, 19xx otherwise)
          // Handle 4-digit year (already full year)
          if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year
          }
          
          attendanceDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        } else {
          console.warn(`Skipping invalid date format: ${fecha}`)
          continue
        }
      } catch (error) {
        console.warn(`Error parsing date ${fecha}:`, error)
        continue
      }
      
      records.push({
        attendance_date: attendanceDate,
        adults_count: adultos,
        kids_count: ninos,
        new_people_count: personasNuevas,
        babies_count: bebes,
        teens_count: teens
      })
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'No valid records found in CSV file' },
        { status: 400 }
      )
    }

    // Import records
    let successCount = 0
    let updateCount = 0
    let insertCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const record of records) {
      try {
        // Check if record exists
        const { data: existing } = await supabase
          .from('service_attendance')
          .select('id')
          .eq('attendance_date', record.attendance_date)
          .single()
        
        if (existing) {
          // Update existing record only if override is enabled
          if (overrideExisting) {
            const { error } = await supabase
              .from('service_attendance')
              .update({
                adults_count: record.adults_count,
                teens_count: record.teens_count,
                kids_count: record.kids_count,
                babies_count: record.babies_count,
                new_people_count: record.new_people_count
              })
              .eq('attendance_date', record.attendance_date)
            
            if (error) {
              errors.push(`${record.attendance_date}: ${error.message}`)
              errorCount++
            } else {
              updateCount++
            }
          } else {
            // Skip existing records if override is disabled
            successCount++
            continue
          }
        } else {
          // Insert new record
          const { error } = await supabase
            .from('service_attendance')
            .insert({
              ...record,
              recorded_by: null // Historical data, no recorder
            })
          
          if (error) {
            errors.push(`${record.attendance_date}: ${error.message}`)
            errorCount++
          } else {
            insertCount++
          }
        }
        
        successCount++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`${record.attendance_date}: ${errorMessage}`)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Import completed',
      summary: {
        total: records.length,
        successful: successCount,
        updated: updateCount,
        inserted: insertCount,
        errors: errorCount
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: unknown) {
    console.error('Error in attendance import:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

