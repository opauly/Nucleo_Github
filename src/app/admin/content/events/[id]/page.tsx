"use client"

import { useState, useEffect } from 'react'
import { EventForm } from '@/components/admin/event-form'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  location?: string
  image_url?: string
  max_participants?: number
  status?: string
  is_featured?: boolean
  team_id?: string
  created_at: string
  updated_at: string
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      const { id } = await params
      
      if (!user) {
        router.push('/iniciar-sesion')
        return
      }

      try {
        const response = await fetch(`/api/admin/events/${id}`)
        const result = await response.json()

        if (response.ok) {
          setEvent(result.event)
        } else {
          toast.error('Evento no encontrado')
          router.push('/admin/content/events')
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        toast.error('Error al cargar el evento')
        router.push('/admin/content/events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params, user, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando evento...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <EventForm 
        event={event}
        onCancel={() => router.push('/admin/content/events')}
      />
    </div>
  )
}
