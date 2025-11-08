"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EventAttendeesExport } from '@/components/ui/event-attendees-export'
import { toast } from 'sonner'
import { Calendar, Plus, Edit, Trash2, ArrowLeft, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  title: string
  description: string
  start_date: string
  end_date?: string
  location?: string
  max_participants?: number
  status: 'draft' | 'published' | 'cancelled'
  is_featured: boolean
  created_at: string
  updated_at: string
}

export default function AdminEventsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      const result = await response.json()

      if (response.ok) {
        const eventsList = result.events || []
        setEvents(eventsList)
        
        // Fetch attendee counts for each event
        if (user && eventsList.length > 0) {
          fetchAttendeeCounts(eventsList.map((e: Event) => e.id))
        }
      } else {
        toast.error(result.error || 'Error al cargar eventos')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendeeCounts = async (eventIds: string[]) => {
    if (!user) return

    const counts: Record<string, number> = {}
    
    // Fetch counts for all events in parallel
    await Promise.all(
      eventIds.map(async (eventId) => {
        try {
          const response = await fetch(`/api/events/${eventId}/attendees`, {
            headers: {
              'Authorization': `Bearer ${user.id}`,
              'x-super-admin': 'true'
            }
          })

          if (response.ok) {
            const result = await response.json()
            counts[eventId] = result.attendees?.length || 0
          } else {
            counts[eventId] = 0
          }
        } catch (error) {
          console.error(`Error fetching attendee count for event ${eventId}:`, error)
          counts[eventId] = 0
        }
      })
    )

    setAttendeeCounts(counts)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Evento eliminado exitosamente')
        fetchEvents()
      } else {
        const result = await response.json()
        toast.error(result.error || 'Error al eliminar evento')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Error de conexión')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Publicado</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Borrador</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex items-center gap-2 bg-blue-600 border-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 shadow-lg"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Panel Principal
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Eventos</h1>
            <p className="text-slate-600">Administra los eventos de la iglesia</p>
          </div>
          <Button onClick={() => router.push('/admin/content/events/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay eventos</h3>
              <p className="text-slate-600 text-center mb-6">
                Aún no se han creado eventos. Crea el primer evento para comenzar.
              </p>
              <Button onClick={() => router.push('/admin/content/events/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Evento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        {event.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Destacado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>Estado: {getStatusBadge(event.status)}</span>
                        <span>Fecha: {formatDate(event.start_date)}</span>
                        {event.end_date && <span>Fin: {formatDate(event.end_date)}</span>}
                        {event.location && <span>Ubicación: {event.location}</span>}
                        {event.max_participants && (
                          <span>Máximo: {event.max_participants} participantes</span>
                        )}
                        <span>Creado: {formatDate(event.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Asistentes ({attendeeCounts[event.id] ?? 0})
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Lista de Asistentes - {event.title}</DialogTitle>
                          </DialogHeader>
                          <EventAttendeesExport eventId={event.id} eventTitle={event.title} />
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/admin/content/events/${event.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none text-slate-600"
                    dangerouslySetInnerHTML={{ 
                      __html: event.description && event.description.length > 200 
                        ? event.description.substring(0, 200) + '...' 
                        : event.description || 'Sin descripción'
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
