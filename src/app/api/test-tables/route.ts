import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    console.log('🔍 Testing table structure...')

    // Test provincias table
    const { data: provinciasData, error: provinciasError } = await supabase
      .from('provincias')
      .select('*')
      .limit(1)

    console.log('📋 Provincias table structure:', provinciasError ? provinciasError.message : 'OK')
    if (provinciasData && provinciasData.length > 0) {
      console.log('📋 Provincias columns:', Object.keys(provinciasData[0]))
    }

    // Test cantones table
    const { data: cantonesData, error: cantonesError } = await supabase
      .from('cantones')
      .select('*')
      .limit(1)

    console.log('📋 Cantones table structure:', cantonesError ? cantonesError.message : 'OK')
    if (cantonesData && cantonesData.length > 0) {
      console.log('📋 Cantones columns:', Object.keys(cantonesData[0]))
    }

    // Test distritos table
    const { data: distritosData, error: distritosError } = await supabase
      .from('distritos')
      .select('*')
      .limit(1)

    console.log('📋 Distritos table structure:', distritosError ? distritosError.message : 'OK')
    if (distritosData && distritosData.length > 0) {
      console.log('📋 Distritos columns:', Object.keys(distritosData[0]))
    }

    return NextResponse.json({
      success: true,
      provincias: {
        error: provinciasError?.message,
        columns: provinciasData && provinciasData.length > 0 ? Object.keys(provinciasData[0]) : []
      },
      cantones: {
        error: cantonesError?.message,
        columns: cantonesData && cantonesData.length > 0 ? Object.keys(cantonesData[0]) : []
      },
      distritos: {
        error: distritosError?.message,
        columns: distritosData && distritosData.length > 0 ? Object.keys(distritosData[0]) : []
      }
    })

  } catch (error: any) {
    console.error('❌ Error testing tables:', error)
    return NextResponse.json(
      { error: error.message || 'Error testing tables' },
      { status: 500 }
    )
  }
}





