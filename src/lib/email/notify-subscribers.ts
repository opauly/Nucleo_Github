import { createClient } from '@supabase/supabase-js'
import { EmailService } from './email-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function notifyAnnouncementSubscribers(
  announcementId: string,
  title: string,
  summary: string
) {
  try {
    // Get all users subscribed to announcements
    const { data: subscribers, error } = await supabase
      .from('profiles')
      .select('id, email, nombre, apellido1, email_subscribe_announcements')
      .eq('email_subscribe_announcements', true)

    if (error) {
      console.error('Error fetching announcement subscribers:', error)
      return { success: false, error: error.message }
    }

    if (!subscribers || subscribers.length === 0) {
      return { success: true, notified: 0 }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const announcementUrl = `${baseUrl}/anuncios/${announcementId}`

    // Send emails to all subscribers (in parallel, but with error handling)
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        const userName = `${subscriber.nombre} ${subscriber.apellido1}`.trim()
        await EmailService.sendAnnouncementNotification(
          subscriber.email,
          userName,
          title,
          summary,
          announcementUrl
        )
        return { success: true, email: subscriber.email }
      } catch (error) {
        console.error(`Error sending email to ${subscriber.email}:`, error)
        return { success: false, email: subscriber.email, error }
      }
    })

    const results = await Promise.allSettled(emailPromises)
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length

    return { success: true, notified: successful, total: subscribers.length }
  } catch (error) {
    console.error('Error in notifyAnnouncementSubscribers:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function notifyEventSubscribers(
  eventId: string,
  title: string,
  startDate: string,
  location: string | null
) {
  try {
    // Get all users subscribed to events
    const { data: subscribers, error } = await supabase
      .from('profiles')
      .select('id, email, nombre, apellido1, email_subscribe_events')
      .eq('email_subscribe_events', true)

    if (error) {
      console.error('Error fetching event subscribers:', error)
      return { success: false, error: error.message }
    }

    if (!subscribers || subscribers.length === 0) {
      return { success: true, notified: 0 }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const eventUrl = `${baseUrl}/eventos/${eventId}`

    const formattedDate = new Date(startDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        const userName = `${subscriber.nombre} ${subscriber.apellido1}`.trim()
        await EmailService.sendEventNotification(
          subscriber.email,
          userName,
          title,
          formattedDate,
          location || 'Por confirmar',
          eventUrl
        )
        return { success: true, email: subscriber.email }
      } catch (error) {
        console.error(`Error sending email to ${subscriber.email}:`, error)
        return { success: false, email: subscriber.email, error }
      }
    })

    const results = await Promise.allSettled(emailPromises)
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length

    return { success: true, notified: successful, total: subscribers.length }
  } catch (error) {
    console.error('Error in notifyEventSubscribers:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function notifyDevotionalSubscribers(
  devotionalId: string,
  title: string,
  author: string,
  summary: string
) {
  try {
    // Get all users subscribed to devotionals
    const { data: subscribers, error } = await supabase
      .from('profiles')
      .select('id, email, nombre, apellido1, email_subscribe_devotionals')
      .eq('email_subscribe_devotionals', true)

    if (error) {
      console.error('Error fetching devotional subscribers:', error)
      return { success: false, error: error.message }
    }

    if (!subscribers || subscribers.length === 0) {
      return { success: true, notified: 0 }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const devotionalUrl = `${baseUrl}/devocionales/${devotionalId}`

    // Send emails to all subscribers
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        const userName = `${subscriber.nombre} ${subscriber.apellido1}`.trim()
        await EmailService.sendDevotionalNotification(
          subscriber.email,
          userName,
          title,
          author,
          summary,
          devotionalUrl
        )
        return { success: true, email: subscriber.email }
      } catch (error) {
        console.error(`Error sending email to ${subscriber.email}:`, error)
        return { success: false, email: subscriber.email, error }
      }
    })

    const results = await Promise.allSettled(emailPromises)
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length

    return { success: true, notified: successful, total: subscribers.length }
  } catch (error) {
    console.error('Error in notifyDevotionalSubscribers:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

