import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyAnnouncementSubscribers } from '@/lib/email/notify-subscribers'

// GET - Fetch single announcement
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

    const { data: announcement, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching announcement:', error)
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      announcement
    })

  } catch (error: unknown) {
    console.error('Error in announcement fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// PUT - Update announcement
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

    const { title, summary, content, status, is_featured = false, image_url } = await request.json()

    if (!title || !summary || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, summary, and content' },
        { status: 400 }
      )
    }

    // Get current announcement to check if it was already published
    const { data: currentAnnouncement } = await supabase
      .from('announcements')
      .select('published_at')
      .eq('id', id)
      .single()

    const wasAlreadyPublished = currentAnnouncement?.published_at !== null

    // Convert status to published_at
    const publishedAt = status === 'published' ? new Date().toISOString() : null
    const isNewlyPublished = status === 'published' && !wasAlreadyPublished

    const { data: announcement, error } = await supabase
      .from('announcements')
      .update({
        title,
        summary,
        content,
        image_url: image_url || null,
        published_at: publishedAt,
        is_featured: is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating announcement:', error)
      return NextResponse.json(
        { error: 'Error updating announcement' },
        { status: 500 }
      )
    }

    // Send email notifications if newly published
    if (isNewlyPublished && announcement) {
      // Don't await - send emails in background
      notifyAnnouncementSubscribers(
        announcement.id,
        announcement.title,
        announcement.summary
      ).catch(error => {
        console.error('Error sending announcement notifications:', error)
        // Don't fail the request if email sending fails
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement
    })

  } catch (error: unknown) {
    console.error('Error in announcement update:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// DELETE - Delete announcement
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
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting announcement:', error)
      return NextResponse.json(
        { error: 'Error deleting announcement' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    })

  } catch (error: unknown) {
    console.error('Error in announcement deletion:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
