import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Fetch all announcements
export async function GET() {
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

    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching announcements:', error)
      return NextResponse.json(
        { error: 'Error fetching announcements' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      announcements: announcements || []
    })

  } catch (error: unknown) {
    console.error('Error in announcements fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// POST - Create new announcement
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

    const { title, summary, content, status = 'draft', is_featured = false, author_id, image_url } = await request.json()

    if (!title || !summary || !content || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, summary, content, and author_id' },
        { status: 400 }
      )
    }

    // Convert status to published_at
    const publishedAt = status === 'published' ? new Date().toISOString() : null

    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert([
        {
          title,
          summary,
          content,
          author_id,
          image_url: image_url || null,
          published_at: publishedAt,
          is_featured: is_featured,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating announcement:', error)
      return NextResponse.json(
        { error: 'Error creating announcement' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    })

  } catch (error: unknown) {
    console.error('Error in announcement creation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
