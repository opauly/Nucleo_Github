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

    // Execute the schema update
    const schemaUpdates = [
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
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS contact_person TEXT;',
        description: 'Add contact person field'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS phone TEXT;',
        description: 'Add phone field'
      },
      {
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS email_contacto TEXT;',
        description: 'Add email contact field'
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
        sql: 'ALTER TABLE teams ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'active\' CHECK (status IN (\'active\', \'inactive\', \'recruiting\'));',
        description: 'Add status field'
      },
      {
        sql: 'CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);',
        description: 'Add status index'
      },
      {
        sql: 'CREATE INDEX IF NOT EXISTS idx_teams_is_featured ON teams(is_featured);',
        description: 'Add featured index'
      },
      {
        sql: 'CREATE INDEX IF NOT EXISTS idx_teams_created_at ON teams(created_at);',
        description: 'Add created_at index'
      }
    ]

    const results = []
    for (const update of schemaUpdates) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: update.sql
        })

        if (error) {
          console.error(`Error with ${update.description}:`, error)
          results.push({
            description: update.description,
            success: false,
            error: error.message
          })
        } else {
          results.push({
            description: update.description,
            success: true
          })
        }
      } catch (err) {
        console.error(`Exception with ${update.description}:`, err)
        results.push({
          description: update.description,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount === totalCount,
      message: `Teams schema updated: ${successCount}/${totalCount} updates applied`,
      results
    })

  } catch (error: unknown) {
    console.error('Error updating teams schema:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
