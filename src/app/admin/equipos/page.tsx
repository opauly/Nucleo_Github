"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Users, Check, X, Clock } from 'lucide-react'

interface TeamMembership {
  id: string
  team_id: string
  profile_id: string
  status: string
  message: string | null
  joined_at: string
  approved_at: string | null
  approved_by: string | null
}

export default function AdminEquiposPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [memberships, setMemberships] = useState<TeamMembership[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/iniciar-sesion')
      return
    }

    fetchMemberships()
  }, [user, router])

  const fetchMemberships = async () => {
    try {
      const response = await fetch('/api/admin/team-memberships')
      const result = await response.json()

      if (response.ok) {
        setMemberships(result.memberships || [])
      } else {
        toast.error('Error al cargar solicitudes')
      }
    } catch (error) {
      console.error('Error fetching memberships:', error)
      toast.error('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (membershipId: string, action: 'approve' | 'reject') => {
    if (!user) return

    setProcessingId(membershipId)

    try {
      const response = await fetch('/api/teams/approve-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          membershipId,
          action,
          adminUserId: user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        fetchMemberships() // Refresh the list
      } else {
        toast.error(result.error || 'Error al procesar solicitud')
      }
    } catch (error) {
      console.error('Error processing membership:', error)
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
            src="/img/equipos-hero.jpg"
            alt="Administración de equipos"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Administración de Equipos
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Gestiona las solicitudes de membresía de equipos
            </p>
          </div>
        </div>
      </section>

      {/* Memberships List */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="max-w-6xl mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
                <p className="text-slate-600">Cargando solicitudes...</p>
              </div>
            </div>
          ) : memberships.length === 0 ? (
            <div className="max-w-6xl mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  No hay solicitudes pendientes
                </h3>
                <p className="text-slate-600">
                  No hay solicitudes de membresía para revisar.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              {memberships.map((membership) => (
                <Card key={membership.id} className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                                                 <div className="flex items-center gap-3 mb-2">
                           <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                             <Users className="w-5 h-5 text-white" />
                           </div>
                           <div>
                             <CardTitle className="text-xl text-slate-900">
                               Solicitud de Membresía
                             </CardTitle>
                             <p className="text-slate-600">ID: {membership.profile_id}</p>
                           </div>
                         </div>
                         <div className="flex items-center gap-4 text-sm text-slate-600">
                           <span><strong>Equipo ID:</strong> {membership.team_id}</span>
                           <span><strong>Usuario ID:</strong> {membership.profile_id}</span>
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
                    {membership.status === 'pending' && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleAction(membership.id, 'approve')}
                          disabled={processingId === membership.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processingId === membership.id ? 'Procesando...' : 'Aprobar'}
                        </Button>
                        <Button
                          onClick={() => handleAction(membership.id, 'reject')}
                          disabled={processingId === membership.id}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          {processingId === membership.id ? 'Procesando...' : 'Rechazar'}
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
