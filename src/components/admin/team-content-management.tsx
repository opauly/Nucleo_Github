"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Star,
  Phone,
  Mail,
  Calendar,
  Target,
  Eye,
  UserCheck,
  UserX,
  Crown,
  CheckCircle,
  AlertCircle,
  Clock,
  User
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { AddMemberModal } from './add-member-modal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TeamMembersExport } from '@/components/ui/team-members-export'

interface TeamMember {
  profile_id: string
  role: string
  team_leader: boolean
  status: string
  joined_at: string
  profiles: {
    id: string
    nombre: string
    apellido1: string
    apellido2: string | null
    email: string
    role: string
  }
}

interface Team {
  id: string
  name: string
  description: string
  mission?: string
  vision?: string
  requirements?: string
  meeting_schedule?: string
  contact_person?: string
  email_contacto?: string
  phone?: string
  image_url?: string
  is_featured: boolean
  max_members?: number
  status: 'active' | 'inactive' | 'recruiting'
  created_at: string
  updated_at: string
  team_members: TeamMember[]
}

export function TeamContentManagement() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [addMemberModal, setAddMemberModal] = useState<{
    isOpen: boolean
    teamId: string
    teamName: string
  }>({
    isOpen: false,
    teamId: '',
    teamName: ''
  })

  useEffect(() => {
    if (user) {
      fetchTeams()
    }
  }, [user])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/admin/teams', {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        }
      })
      const result = await response.json()

      if (response.ok) {
        setTeams(result.teams || [])
      } else {
        toast.error(result.error || 'Error al cargar equipos')
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editingTeam) return

    try {
      const response = await fetch(`/api/admin/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        },
        body: JSON.stringify(editingTeam)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Equipo actualizado exitosamente')
        setIsEditing(false)
        setEditingTeam(null)
        fetchTeams()
      } else {
        toast.error(result.error || 'Error al actualizar equipo')
      }
    } catch (error) {
      console.error('Error updating team:', error)
      toast.error('Error de conexión')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingTeam(null)
  }

  const handleDelete = async (teamId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este equipo? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        }
      })

      if (response.ok) {
        toast.success('Equipo eliminado exitosamente')
        fetchTeams()
      } else {
        const result = await response.json()
        toast.error(result.error || 'Error al eliminar equipo')
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      toast.error('Error de conexión')
    }
  }

  const handleApproveMember = async (teamId: string, profileId: string) => {
    try {
      const response = await fetch('/api/teams/approve-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        },
        body: JSON.stringify({
          teamId: teamId,
          profileId: profileId,
          action: 'approve',
          adminUserId: user?.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Miembro aprobado exitosamente')
        fetchTeams()
      } else {
        toast.error(result.error || 'Error al aprobar miembro')
      }
    } catch (error) {
      console.error('Error approving member:', error)
      toast.error('Error de conexión')
    }
  }

  const handleRejectMember = async (teamId: string, profileId: string) => {
    try {
      const response = await fetch('/api/teams/approve-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        },
        body: JSON.stringify({
          teamId: teamId,
          profileId: profileId,
          action: 'reject',
          adminUserId: user?.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Solicitud rechazada exitosamente')
        fetchTeams()
      } else {
        toast.error(result.error || 'Error al rechazar solicitud')
      }
    } catch (error) {
      console.error('Error rejecting member:', error)
      toast.error('Error de conexión')
    }
  }

  const handleRemoveMember = async (teamId: string, profileId: string) => {
    if (!confirm('¿Estás seguro de que quieres remover este miembro del equipo?')) {
      return
    }

    console.log('Removing member:', { teamId, profileId, user: user?.id, email: user?.email })

    try {
      const response = await fetch('/api/teams/remove-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        },
        body: JSON.stringify({
          team_id: teamId,
          profile_id: profileId
        })
      })

      console.log('Remove member response:', response.status, response.statusText)
      const result = await response.json()
      console.log('Remove member result:', result)

      if (response.ok) {
        toast.success('Miembro removido exitosamente')
        fetchTeams()
      } else {
        toast.error(result.error || 'Error al remover miembro')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Error de conexión')
    }
  }

  const handleToggleLeader = async (teamId: string, profileId: string, isLeader: boolean) => {
    try {
      const response = await fetch('/api/admin/teams/update-member-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        },
        body: JSON.stringify({
          team_id: teamId,
          profile_id: profileId,
          team_leader: !isLeader
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(isLeader ? 'Líder removido exitosamente' : 'Líder asignado exitosamente')
        fetchTeams()
      } else {
        toast.error(result.error || 'Error al actualizar rol')
      }
    } catch (error) {
      console.error('Error updating member role:', error)
      toast.error('Error de conexión')
    }
  }

  const handleChangeMemberStatus = async (teamId: string, profileId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved'
    const action = newStatus === 'approved' ? 'approve' : 'reject'

    try {
      const response = await fetch('/api/teams/approve-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        },
        body: JSON.stringify({
          teamId: teamId,
          profileId: profileId,
          action: action,
          adminUserId: user?.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(newStatus === 'approved' ? 'Miembro aprobado exitosamente' : 'Miembro rechazado exitosamente')
        fetchTeams()
      } else {
        toast.error(result.error || 'Error al cambiar estado del miembro')
      }
    } catch (error) {
      console.error('Error changing member status:', error)
      toast.error('Error de conexión')
    }
  }

  const handleAddMember = (teamId: string, teamName: string) => {
    setAddMemberModal({
      isOpen: true,
      teamId,
      teamName
    })
  }

  const handleMemberAdded = () => {
    fetchTeams()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Inactivo</Badge>
      case 'recruiting':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Reclutando</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Contenido de Equipos</h2>
          <p className="text-slate-600">Administra la información detallada de cada equipo</p>
        </div>
        <Button onClick={() => window.open('/equipos', '_blank')}>
          <Eye className="w-4 h-4 mr-2" />
          Ver Página Pública
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay equipos</h3>
            <p className="text-slate-600 text-center">
              Aún no se han creado equipos. Los equipos se crean desde la gestión de equipos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      {team.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Star className="w-3 h-3 mr-1" />
                          Destacado
                        </Badge>
                      )}
                      {getStatusBadge(team.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Creado: {new Date(team.created_at).toLocaleDateString('es-ES')}</span>
                      {team.max_members && (
                        <span>Máximo: {team.max_members} miembros</span>
                      )}
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
                          Miembros ({team.team_members.length})
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Lista de Miembros - {team.name}</DialogTitle>
                        </DialogHeader>
                        <TeamMembersExport teamId={team.id} teamName={team.name} />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(team)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Contenido
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(team.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Descripción</h4>
                        <p className="text-slate-600 text-sm mb-4">
                          {team.description || 'Sin descripción'}
                        </p>
                        
                        {team.mission && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Misión
                            </h4>
                            <p className="text-slate-600 text-sm">{team.mission}</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        {team.contact_person && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Contacto
                            </h4>
                            <p className="text-slate-600 text-sm">{team.contact_person}</p>
                          </div>
                        )}
                        
                        {team.meeting_schedule && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Horario de Reuniones
                            </h4>
                            <p className="text-slate-600 text-sm">{team.meeting_schedule}</p>
                          </div>
                        )}
                      </div>
                    </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editingTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Editar Contenido del Equipo</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Equipo</Label>
                  <Input
                    id="name"
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={editingTeam.status} onValueChange={(value) => setEditingTeam({...editingTeam, status: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="recruiting">Reclutando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={editingTeam.description}
                  onChange={(e) => setEditingTeam({...editingTeam, description: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mission">Misión</Label>
                  <Textarea
                    id="mission"
                    value={editingTeam.mission || ''}
                    onChange={(e) => setEditingTeam({...editingTeam, mission: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vision">Visión</Label>
                  <Textarea
                    id="vision"
                    value={editingTeam.vision || ''}
                    onChange={(e) => setEditingTeam({...editingTeam, vision: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea
                  id="requirements"
                  value={editingTeam.requirements || ''}
                  onChange={(e) => setEditingTeam({...editingTeam, requirements: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Persona de Contacto</Label>
                  <Input
                    id="contact_person"
                    value={editingTeam.contact_person || ''}
                    onChange={(e) => setEditingTeam({...editingTeam, contact_person: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email_contacto">Email de Contacto</Label>
                  <Input
                    id="email_contacto"
                    type="email"
                    value={editingTeam.email_contacto || ''}
                    onChange={(e) => setEditingTeam({...editingTeam, email_contacto: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={editingTeam.phone || ''}
                    onChange={(e) => setEditingTeam({...editingTeam, phone: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_members">Máximo de Miembros</Label>
                  <Input
                    id="max_members"
                    type="number"
                    value={editingTeam.max_members || ''}
                    onChange={(e) => setEditingTeam({...editingTeam, max_members: parseInt(e.target.value) || undefined})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_schedule">Horario de Reuniones</Label>
                <Input
                  id="meeting_schedule"
                  value={editingTeam.meeting_schedule || ''}
                  onChange={(e) => setEditingTeam({...editingTeam, meeting_schedule: e.target.value})}
                  placeholder="Ej: Domingos 2:00 PM"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={addMemberModal.isOpen}
        onClose={() => setAddMemberModal({ isOpen: false, teamId: '', teamName: '' })}
        teamId={addMemberModal.teamId}
        teamName={addMemberModal.teamName}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  )
}
