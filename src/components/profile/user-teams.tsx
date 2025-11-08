"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X,
  UserX,
  Crown,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

interface TeamMembership {
  team_id: string
  role: string
  team_leader: boolean
  status: string
  joined_at: string
  message: string | null
  teams: {
    id: string
    name: string
    description: string
    image_url: string | null
    status: string
    created_at: string
  }
}

export function UserTeams() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<TeamMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [removalModal, setRemovalModal] = useState<{
    isOpen: boolean
    teamId: string
    teamName: string
  }>({
    isOpen: false,
    teamId: '',
    teamName: ''
  })
  const [removalReason, setRemovalReason] = useState('')
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserTeams()
    }
  }, [user])

  const fetchUserTeams = async () => {
    try {
      const response = await fetch('/api/user/teams', {
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        setTeams(result.memberships)
      } else {
        toast.error(result.error || 'Error al cargar equipos')
      }
    } catch (error) {
      console.error('Error fetching user teams:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestRemoval = async () => {
    if (!removalReason.trim()) {
      toast.error('Por favor proporciona una razón para la remoción')
      return
    }

    setRemoving(true)
    try {
      const response = await fetch('/api/user/request-team-removal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`
        },
        body: JSON.stringify({
          team_id: removalModal.teamId,
          reason: removalReason
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Solicitud de remoción enviada exitosamente')
        setRemovalModal({ isOpen: false, teamId: '', teamName: '' })
        setRemovalReason('')
        fetchUserTeams()
      } else {
        toast.error(result.error || 'Error al solicitar remoción')
      }
    } catch (error) {
      console.error('Error requesting team removal:', error)
      toast.error('Error de conexión')
    } finally {
      setRemoving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aprobado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rechazado</Badge>
      case 'removal_requested':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Solicitud de Remoción</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string, isLeader: boolean) => {
    if (isLeader) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Líder</Badge>
    }
    switch (role) {
      case 'lider':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Líder</Badge>
      case 'coordinador':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Coordinador</Badge>
      case 'miembro':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Miembro</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{role}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mis Equipos
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
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mis Equipos ({teams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No perteneces a ningún equipo aún</p>
              <Button className="mt-4" asChild>
                <a href="/equipos">Explorar Equipos</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map((membership) => (
                <div key={membership.team_id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{membership.teams.name}</h3>
                        {membership.team_leader && (
                          <Crown className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{membership.teams.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(membership.status)}
                        {membership.status === 'approved' && getRoleBadge(membership.role, membership.team_leader)}
                      </div>
                      <p className="text-xs text-slate-500">
                        Unido: {new Date(membership.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={`/equipos/${membership.team_id}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ver Equipo
                        </a>
                      </Button>
                      {membership.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRemovalModal({
                            isOpen: true,
                            teamId: membership.team_id,
                            teamName: membership.teams.name
                          })}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Solicitar Remoción
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
          setRemovalModal({ isOpen: false, teamId: '', teamName: '' })
          setRemovalReason('')
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Solicitar Remoción del Equipo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              ¿Estás seguro de que quieres solicitar tu remoción del equipo <strong>{removalModal.teamName}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Razón (opcional)
              </label>
              <Textarea
                placeholder="Explica por qué quieres salir del equipo..."
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setRemovalModal({ isOpen: false, teamId: '', teamName: '' })}
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
                  'Solicitar Remoción'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
