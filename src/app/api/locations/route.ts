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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const parentId = searchParams.get('parentId')

    console.log('🔍 Fetching locations:', { type, parentId })

    if (type === 'provincias') {
      const { data, error } = await supabase
        .from('provincias')
        .select('*')
        .order('nombre')

      if (error) {
        throw error
      }

      return NextResponse.json({ data })
    }

    if (type === 'cantones' && parentId) {
      const { data, error } = await supabase
        .from('cantones')
        .select('*')
        .eq('provincia_id', parentId)
        .order('nombre')

      if (error) {
        throw error
      }

      return NextResponse.json({ data })
    }

    if (type === 'cantones-by-name') {
      const { data, error } = await supabase
        .from('cantones')
        .select('*')
        .order('nombre')

      if (error) {
        throw error
      }

      return NextResponse.json({ data })
    }

    if (type === 'distritos' && parentId) {
      const { data, error } = await supabase
        .from('distritos')
        .select('*')
        .eq('canton_id', parentId)
        .order('nombre')

      if (error) {
        throw error
      }

      return NextResponse.json({ data })
    }

    return NextResponse.json(
      { error: 'Invalid type parameter. Use: provincias, cantones, or distritos' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('❌ Error fetching locations:', error)
    return NextResponse.json(
      { error: error.message || 'Error fetching locations' },
      { status: 500 }
    )
  }
}
