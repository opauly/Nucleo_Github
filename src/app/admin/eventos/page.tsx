"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Calendar, Check, X, Clock } from 'lucide-react'

interface EventRegistration {
  id: string
  event_id: string
  profile_id: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export default function AdminEventosPage() {
  const { user, session } = useAuth()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/iniciar-sesion')
      return
    }

    if (session?.access_token) {
      fetchRegistrations()
    }
  }, [user, session?.access_token, router])

  const fetchRegistrations = async () => {
    if (!session?.access_token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/event-registrations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const result = await response.json()

      if (response.ok) {
        setRegistrations(result.registrations || [])
      } else {
        toast.error('Error al cargar registros')
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      toast.error('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (registrationId: string, action: 'approve' | 'reject') => {
    if (!user || !session?.access_token) {
      toast.error('Sesion invalida. Vuelve a iniciar sesion.')
      return
    }

    setProcessingId(registrationId)

    try {
      const response = await fetch('/api/events/approve-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          registrationId,
          action
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        fetchRegistrations() // Refresh the list
      } else {
        toast.error(result.error || 'Error al procesar registro')
      }
    } catch (error) {
      console.error('Error processing registration:', error)
      toast.error('Error de conexión')
    } finally {
      setProcessingId(null)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-600 text-white"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>
      case 'approved':
        return <Badge className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />Aprobado</Badge>
      case 'rejected':
        return <Badge className="bg-red-600 text-white"><X className="w-3 h-3 mr-1" />Rechazado</Badge>
      default:
        return <Badge className="bg-slate-600 text-white">{status}</Badge>
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          <img
            src="/img/eventos-hero.jpg"
            alt="Administración de eventos"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Administración de Eventos
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Gestiona las inscripciones a eventos
            </p>
          </div>
        </div>
      </section>

      {/* Registrations List */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="max-w-6xl mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
                <p className="text-slate-600">Cargando registros...</p>
              </div>
            </div>
          ) : registrations.length === 0 ? (
            <div className="max-w-6xl mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  No hay registros de eventos
                </h3>
                <p className="text-slate-600">
                  No hay inscripciones a eventos para revisar.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              {registrations.map((registration) => (
                <Card key={registration.id} className="shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-slate-900">
                              Inscripción a Evento
                            </CardTitle>
                            <p className="text-slate-600">ID: {registration.profile_id}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-start gap-x-4 gap-y-1 text-sm text-slate-600">
                          <span><strong>Evento ID:</strong> {registration.event_id}</span>
                          <span><strong>Usuario ID:</strong> {registration.profile_id}</span>
                          <span><strong>Registrado:</strong> {formatDate(registration.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 xl:items-end">
                        {getStatusBadge(registration.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {registration.notes && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700">
                          <strong>Notas:</strong> {registration.notes}
                        </p>
                      </div>
                    )}
                    {registration.status === 'pending' && (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                          onClick={() => handleAction(registration.id, 'approve')}
                          disabled={processingId === registration.id}
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processingId === registration.id ? 'Procesando...' : 'Aprobar'}
                        </Button>
                        <Button
                          onClick={() => handleAction(registration.id, 'reject')}
                          disabled={processingId === registration.id}
                          variant="outline"
                          className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-50"
                        >
                          {processingId === registration.id ? 'Procesando...' : 'Rechazar'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
