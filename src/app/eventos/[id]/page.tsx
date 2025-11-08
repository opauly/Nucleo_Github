import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Users, ArrowLeft, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { EventRegistrationButton } from '@/components/ui/event-registration-button'
import { EventShareButton } from '@/components/ui/event-share-button'
import { notFound } from 'next/navigation'

interface Event {
  id: string
  title: string
  description?: string
  start_date: string
  end_date?: string
  location?: string
  image_url?: string
  max_participants?: number
  status: string
  is_featured?: boolean
  created_at: string
  updated_at: string
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  let event: Event | null = null
  let error = null

  if (supabase) {
    const { data, error: fetchError } = await supabase
      .from('events')
      .select(`
        *,
        event_teams (
          teams (
            id,
            name
          )
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (fetchError) {
      error = fetchError.message
    } else {
      event = data
    }
  }

  if (!event) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isUpcoming = (event: any) => {
    const now = new Date()
    // Use end_date if it exists, otherwise use start_date
    const dateToCheck = event.end_date ? new Date(event.end_date) : new Date(event.start_date)
    return dateToCheck > now
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {event.image_url ? (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover opacity-40"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
        )}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/eventos">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Eventos
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                {event.is_featured && (
                  <Badge className="bg-blue-600 text-white">
                    Destacado
                  </Badge>
                )}
                {isUpcoming(event) ? (
                  <Badge className="bg-green-600 text-white">
                    Próximo
                  </Badge>
                ) : (
                  <Badge className="bg-slate-600 text-white">
                    Pasado
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-6 text-slate-200 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>
                    {formatTime(event.start_date)}
                    {event.end_date && ` - ${formatTime(event.end_date)}`}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Content */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg">
                  <CardContent className="p-8">
                    <div className="prose prose-slate max-w-none">
                      <div 
                        className="text-lg text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: event.description || '<p>Descripción del evento próximamente...</p>' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Event Details */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Detalles del Evento</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Fecha de Inicio</p>
                          <p className="text-sm text-slate-600">{formatDate(event.start_date)}</p>
                        </div>
                      </div>
                      {event.end_date && (
                        <div className="flex items-center gap-3">
                          <CalendarCheck className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">Fecha de Fin</p>
                            <p className="text-sm text-slate-600">{formatDate(event.end_date)}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Hora</p>
                          <p className="text-sm text-slate-600">
                            {formatTime(event.start_date)}
                            {event.end_date && ` - ${formatTime(event.end_date)}`}
                          </p>
                        </div>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">Ubicación</p>
                            <p className="text-sm text-slate-600">{event.location}</p>
                          </div>
                        </div>
                      )}
                      {event.max_participants && (
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">Capacidad</p>
                            <p className="text-sm text-slate-600">Máximo {event.max_participants} participantes</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Team Information */}
                      {event.event_teams && event.event_teams.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-slate-500 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 mb-2">Equipos Responsables</p>
                            <div className="flex flex-wrap gap-2">
                              {event.event_teams.map((eventTeam: any) => (
                                <Badge 
                                  key={eventTeam.teams?.id} 
                                  variant="secondary" 
                                  className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                                >
                                  {eventTeam.teams?.name || 'Equipo'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Registration */}
                {isUpcoming(event) && (
                  <Card className="shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Inscripción</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        ¿Te gustaría participar en este evento? Inscríbete ahora.
                      </p>
                      <EventRegistrationButton
                        eventId={event.id}
                        eventTitle={event.title}
                        isUpcoming={isUpcoming(event)}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Share */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Compartir</h3>
                    <EventShareButton eventId={event.id} eventTitle={event.title} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
