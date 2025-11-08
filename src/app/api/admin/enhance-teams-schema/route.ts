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

    // Add new columns to teams table for richer content
    const enhancements = [
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS mission TEXT;',
        description: 'Add mission field'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS vision TEXT;',
        description: 'Add vision field'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS requirements TEXT;',
        description: 'Add requirements field'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS meeting_schedule TEXT;',
        description: 'Add meeting schedule field'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);',
        description: 'Add contact person field'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS phone VARCHAR(20);',
        description: 'Add phone field'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);',
        description: 'Add image URL field'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;',
        description: 'Add featured flag'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS max_members INTEGER;',
        description: 'Add max members field'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'active\' CHECK (status IN (\'active\', \'inactive\', \'recruiting\'));',
        description: 'Add status field'
      }
    ]

    const results = []
    for (const enhancement of enhancements) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: enhancement.sql
        })

        if (error) {
          console.error(`Error with ${enhancement.description}:`, error)
          results.push({
            description: enhancement.description,
            success: false,
            error: error.message
          })
        } else {
          results.push({
            description: enhancement.description,
            success: true
          })
        }
      } catch (err) {
        console.error(`Exception with ${enhancement.description}:`, err)
        results.push({
          description: enhancement.description,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount === totalCount,
      message: `Enhanced teams schema: ${successCount}/${totalCount} enhancements applied`,
      results
    })

  } catch (error: unknown) {
    console.error('Error enhancing teams schema:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}


