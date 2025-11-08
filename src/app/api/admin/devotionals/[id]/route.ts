import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Fetch single devotional
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const { data: devotional, error } = await supabase
      .from('devotionals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching devotional:', error)
      return NextResponse.json(
        { error: 'Devotional not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      devotional
    })

  } catch (error: unknown) {
    console.error('Error in devotional fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// PUT - Update devotional
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const { title, summary, author, content, status, is_featured = false, image_url } = await request.json()

    if (!title || !summary || !author || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, summary, author, and content' },
        { status: 400 }
      )
    }

    // Convert status to published_at
    const publishedAt = status === 'published' ? new Date().toISOString() : null

    const { data: devotional, error } = await supabase
      .from('devotionals')
      .update({
        title,
        summary,
        author,
        content,
        image_url: image_url || null,
        published_at: publishedAt, // Mapped from status
                  is_featured: is_featured,   // From form input
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating devotional:', error)
      return NextResponse.json(
        { error: 'Error updating devotional' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Devotional updated successfully',
      devotional
    })

  } catch (error: unknown) {
    console.error('Error in devotional update:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE - Delete devotional
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const { error } = await supabase
      .from('devotionals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting devotional:', error)
      return NextResponse.json(
        { error: 'Error deleting devotional' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Devotional deleted successfully'
    })

  } catch (error: unknown) {
    console.error('Error in devotional deletion:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
