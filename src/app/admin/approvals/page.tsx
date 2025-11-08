"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Users, Calendar, Check, X, ArrowLeft, Clock } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'

interface TeamMembership {
  team_id: string
  profile_id: string
  status: string
  message: string | null
  joined_at: string
  approved_at: string | null
  approved_by: string | null
  profiles: {
    id: string
    nombre: string
    apellido1: string
    apellido2: string | null
    email: string
  }
  teams: {
    id: string
    name: string
    description: string
  }
}

interface EventRegistration {
  id: string
  event_id: string
  profile_id: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  profiles: {
    id: string
    nombre: string
    apellido1: string
    apellido2: string | null
    email: string
  }
  events: {
    id: string
    title: string
    start_date: string
    location: string
  }
}

export default function AdminApprovalsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [teamMemberships, setTeamMemberships] = useState<TeamMembership[]>([])
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [teamsResponse, eventsResponse] = await Promise.all([
        fetch('/api/admin/team-memberships'),
        fetch('/api/admin/event-registrations')
      ])

      if (teamsResponse.ok) {
        const teamsResult = await teamsResponse.json()
        setTeamMemberships(teamsResult.memberships || [])
      }

      if (eventsResponse.ok) {
        const eventsResult = await eventsResponse.json()
        setEventRegistrations(eventsResult.registrations || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleTeamAction = async (membership: TeamMembership, action: 'approve' | 'reject') => {
    if (!user) return

    const membershipKey = `${membership.team_id}-${membership.profile_id}`
    setProcessingId(membershipKey)

    try {
      const response = await fetch('/api/teams/approve-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: membership.team_id,
          profileId: membership.profile_id,
          action,
          adminUserId: user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        fetchData() // Refresh the data
      } else {
        toast.error(result.error || 'Error al procesar membresía')
      }
    } catch (error) {
      console.error('Error processing membership:', error)
      toast.error('Error de conexión')
    } finally {
      setProcessingId(null)
    }
  }

  const handleEventAction = async (registration: EventRegistration, action: 'approve' | 'reject') => {
    if (!user) return

    setProcessingId(registration.id)

    try {
      const response = await fetch('/api/events/approve-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: registration.id,
          action,
          adminUserId: user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        fetchData() // Refresh the data
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><Check className="w-3 h-3 mr-1" />Aprobado</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><X className="w-3 h-3 mr-1" />Rechazado</Badge>
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

  const formatUserName = (profile: any) => {
    const fullName = `${profile.nombre} ${profile.apellido1}${profile.apellido2 ? ` ${profile.apellido2}` : ''}`
    return fullName.trim()
  }

  const pendingTeams = teamMemberships.filter(m => m.status === 'pending')
  const pendingEvents = eventRegistrations.filter(r => r.status === 'pending')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
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
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aprobaciones Pendientes</h1>
          <p className="text-slate-600">Gestiona las solicitudes de equipos y registros de eventos</p>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Equipos ({pendingTeams.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Eventos ({pendingEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-6">
          {pendingTeams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay solicitudes pendientes</h3>
                <p className="text-slate-600 text-center">
                  No hay solicitudes de membresía de equipos para revisar.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingTeams.map((membership) => (
              <Card key={`${membership.team_id}-${membership.profile_id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-green-600" />
                        <CardTitle className="text-xl">Solicitud de Membresía</CardTitle>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span><strong>Usuario:</strong> {formatUserName(membership.profiles)}</span>
                        <span><strong>Email:</strong> {membership.profiles.email}</span>
                        <span><strong>Equipo:</strong> {membership.teams.name}</span>
                        <span><strong>Solicitado:</strong> {formatDate(membership.joined_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(membership.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {membership.message && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">
                        <strong>Mensaje:</strong> {membership.message}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleTeamAction(membership, 'approve')}
                      disabled={processingId === `${membership.team_id}-${membership.profile_id}`}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processingId === `${membership.team_id}-${membership.profile_id}` ? 'Procesando...' : 'Aprobar'}
                    </Button>
                    <Button
                      onClick={() => handleTeamAction(membership, 'reject')}
                      disabled={processingId === `${membership.team_id}-${membership.profile_id}`}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      {processingId === `${membership.team_id}-${membership.profile_id}` ? 'Procesando...' : 'Rechazar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {pendingEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-16 h-16 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay registros pendientes</h3>
                <p className="text-slate-600 text-center">
                  No hay registros de eventos para revisar.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingEvents.map((registration) => (
              <Card key={registration.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-xl">Inscripción a Evento</CardTitle>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span><strong>Usuario:</strong> {formatUserName(registration.profiles)}</span>
                        <span><strong>Email:</strong> {registration.profiles.email}</span>
                        <span><strong>Evento:</strong> {registration.events.title}</span>
                        <span><strong>Fecha del Evento:</strong> {formatDate(registration.events.start_date)}</span>
                        <span><strong>Registrado:</strong> {formatDate(registration.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
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
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleEventAction(registration, 'approve')}
                      disabled={processingId === registration.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processingId === registration.id ? 'Procesando...' : 'Aprobar'}
                    </Button>
                    <Button
                      onClick={() => handleEventAction(registration, 'reject')}
                      disabled={processingId === registration.id}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      {processingId === registration.id ? 'Procesando...' : 'Rechazar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
