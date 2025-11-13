import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyDevotionalSubscribers } from '@/lib/email/notify-subscribers'

// GET - Fetch all devotionals
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

    const { data: devotionals, error } = await supabase
      .from('devotionals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching devotionals:', error)
      return NextResponse.json(
        { error: 'Error fetching devotionals' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      devotionals: devotionals || []
    })

  } catch (error: unknown) {
    console.error('Error in devotionals fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// POST - Create new devotional
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

    const { title, summary, author, content, status = 'draft', is_featured = false, author_id, image_url } = await request.json()

    if (!title || !summary || !author || !content || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, summary, author, content, and author_id' },
        { status: 400 }
      )
    }

    // Convert status to published_at
    const publishedAt = status === 'published' ? new Date().toISOString() : null

    const { data: devotional, error } = await supabase
      .from('devotionals')
      .insert([
        {
          title,
          summary,
          author,
          content,
          author_id,
          image_url: image_url || null,
          published_at: publishedAt, // Mapped from status
          is_featured: is_featured,   // From form input
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating devotional:', error)
      return NextResponse.json(
        { error: 'Error creating devotional' },
        { status: 500 }
      )
    }

    // Send email notifications if published
    if (status === 'published' && devotional) {
      // Don't await - send emails in background
      notifyDevotionalSubscribers(
        devotional.id,
        devotional.title,
        devotional.author,
        devotional.summary
      ).catch(error => {
        console.error('Error sending devotional notifications:', error)
        // Don't fail the request if email sending fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Devotional created successfully',
      devotional
    })

  } catch (error: unknown) {
    console.error('Error in devotional creation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
