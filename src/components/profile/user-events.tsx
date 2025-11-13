"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X,
  UserX,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { calculateNextOccurrence, type RecurrenceConfig } from '@/lib/utils/recurrence'

interface EventRegistration {
  event_id: string
  status: string
  created_at: string
  notes: string | null
  events: {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string | null
    location: string
    image_url: string | null
    status: string
    is_recurring?: boolean
    recurrence_type?: 'weekly' | 'biweekly' | 'monthly' | 'annually'
    recurrence_pattern?: 'days' | 'dates'
    recurrence_days?: number[]
    recurrence_dates?: number[]
    recurrence_end_date?: string | null
    recurrence_start_date?: string
    created_at: string
  }
}

type FilterType = 'all' | 'upcoming' | 'past'

export function UserEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [removalModal, setRemovalModal] = useState<{
    isOpen: boolean
    eventId: string
    eventTitle: string
  }>({
    isOpen: false,
    eventId: '',
    eventTitle: ''
  })
  const [removalReason, setRemovalReason] = useState('')
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserEvents()
    }
  }, [user])

  const fetchUserEvents = async () => {
    try {
      const response = await fetch('/api/user/events', {
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setEvents(result.registrations)
      } else {
        toast.error(result.error || 'Error al cargar eventos')
      }
    } catch (error) {
      console.error('Error fetching user events:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestRemoval = async () => {
    if (!removalReason.trim()) {
      toast.error('Por favor proporciona una razón para la cancelación')
      return
    }

    setRemoving(true)
    try {
      const response = await fetch('/api/user/request-event-removal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify({
          event_id: removalModal.eventId,
          reason: removalReason
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Solicitud de cancelación enviada exitosamente')
        setRemovalModal({ isOpen: false, eventId: '', eventTitle: '' })
        setRemovalReason('')
        fetchUserEvents()
      } else {
        toast.error(result.error || 'Error al solicitar cancelación')
      }
    } catch (error) {
      console.error('Error requesting event removal:', error)
      toast.error('Error de conexión')
    } finally {
      setRemoving(false)
    }
  }

  const getStatusBadge = (status: string, notes?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>
      case 'rejected':
        // Check if it's a user-initiated cancellation based on notes
        if (notes && notes.includes('Solicitud de cancelación')) {
          return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Cancelado</Badge>
        }
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rechazado</Badge>
      case 'cancelled':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isEventUpcoming = (event: any) => {
    const now = new Date()
    
    // For recurring events, check if there's a next occurrence
    if (event.is_recurring && event.recurrence_type && event.recurrence_pattern) {
      const recurrenceConfig: RecurrenceConfig = {
        is_recurring: event.is_recurring,
        recurrence_type: event.recurrence_type,
        recurrence_pattern: event.recurrence_pattern,
        recurrence_days: event.recurrence_days || [],
        recurrence_dates: event.recurrence_dates || [],
        recurrence_start_date: event.recurrence_start_date || event.start_date,
        recurrence_end_date: event.recurrence_end_date,
        start_date: event.start_date
      }
      const nextOccurrence = calculateNextOccurrence(recurrenceConfig, now)
      return nextOccurrence !== null && nextOccurrence > now
    }
    
    // For non-recurring events, use end_date if it exists, otherwise use start_date
    const dateToCheck = event.end_date ? new Date(event.end_date) : new Date(event.start_date)
    return dateToCheck > now
  }

  const getEventDisplayDate = (event: any) => {
    const now = new Date()
    
    // For recurring events, calculate next occurrence
    if (event.is_recurring && event.recurrence_type && event.recurrence_pattern) {
      const recurrenceConfig: RecurrenceConfig = {
        is_recurring: event.is_recurring,
        recurrence_type: event.recurrence_type,
        recurrence_pattern: event.recurrence_pattern,
        recurrence_days: event.recurrence_days || [],
        recurrence_dates: event.recurrence_dates || [],
        recurrence_start_date: event.recurrence_start_date || event.start_date,
        recurrence_end_date: event.recurrence_end_date,
        start_date: event.start_date
      }
      const nextOccurrence = calculateNextOccurrence(recurrenceConfig, now)
      return nextOccurrence || new Date(event.start_date)
    }
    
    // For non-recurring events, use start_date
    return new Date(event.start_date)
  }

  const getFilteredEvents = () => {
    if (filter === 'all') {
      return events
    }
    
    return events.filter((registration) => {
      const isUpcoming = isEventUpcoming(registration.events)
      if (filter === 'upcoming') {
        return isUpcoming
      } else if (filter === 'past') {
        return !isUpcoming
      }
      return true
    })
  }

  const filteredEvents = getFilteredEvents()
  
  const upcomingCount = events.filter((r) => isEventUpcoming(r.events)).length
  const pastCount = events.filter((r) => !isEventUpcoming(r.events)).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Mis Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Mis Eventos ({filteredEvents.length})
            </CardTitle>
          </div>
          {events.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="flex-shrink-0"
              >
                Todos ({events.length})
              </Button>
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('upcoming')}
                className="flex-shrink-0"
              >
                Próximos ({upcomingCount})
              </Button>
              <Button
                variant={filter === 'past' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('past')}
                className="flex-shrink-0"
              >
                Pasados ({pastCount})
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No estás registrado en ningún evento</p>
              <Button className="mt-4" asChild>
                <a href="/eventos">Explorar Eventos</a>
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">
                {filter === 'upcoming' 
                  ? 'No tienes eventos próximos' 
                  : filter === 'past'
                  ? 'No tienes eventos pasados'
                  : 'No hay eventos para mostrar'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((registration) => (
                <div key={registration.event_id} className="p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 flex-shrink-0">{registration.events.title}</h3>
                        {isEventUpcoming(registration.events) && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex-shrink-0">Próximo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {registration.events.description?.replace(/<[^>]*>/g, '') || ''}
                      </p>
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="break-words">
                            {formatDate(getEventDisplayDate(registration.events).toISOString())}
                            {!registration.events.is_recurring && registration.events.end_date && registration.events.end_date !== registration.events.start_date && (
                              <span> - {formatDate(registration.events.end_date)}</span>
                            )}
                          </span>
                        </div>
                        {registration.events.location && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="break-words">{registration.events.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(registration.status, registration.notes)}
                      </div>
                      <p className="text-xs text-slate-500">
                        Registrado: {new Date(registration.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="whitespace-nowrap w-full sm:w-auto"
                      >
                        <a href={`/eventos/${registration.event_id}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ver Evento
                        </a>
                      </Button>
                      {registration.status === 'approved' && isEventUpcoming(registration.events) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRemovalModal({
                            isOpen: true,
                            eventId: registration.event_id,
                            eventTitle: registration.events.title
                          })}
                          className="text-red-600 border-red-300 hover:bg-red-50 whitespace-nowrap w-full sm:w-auto"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Removal Request Modal */}
      <Dialog open={removalModal.isOpen} onOpenChange={(open) => {
        if (!open) {
          setRemovalModal({ isOpen: false, eventId: '', eventTitle: '' })
          setRemovalReason('')
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Cancelar Registro al Evento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              ¿Estás seguro de que quieres cancelar tu registro al evento <strong>{removalModal.eventTitle}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Razón (opcional)
              </label>
              <Textarea
                placeholder="Explica por qué quieres cancelar tu registro..."
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setRemovalModal({ isOpen: false, eventId: '', eventTitle: '' })}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRequestRemoval}
                disabled={removing}
                className="bg-red-600 hover:bg-red-700"
              >
                {removing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Solicitar Cancelación'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
