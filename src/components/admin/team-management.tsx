"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Users, Crown, User, UserCheck, UserX } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

interface TeamMember {
  profile_id: string
  role: 'miembro' | 'lider'
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
  created_at: string
  updated_at: string
  team_members: TeamMember[]
}

export function TeamManagement() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingMember, setUpdatingMember] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchTeams()
    }
  }, [user])

  const fetchTeams = async () => {
    try {
      // For opaulyc@gmail.com, bypass the authorization check
      if (user?.email === 'opaulyc@gmail.com') {
        const response = await fetch('/api/admin/teams', {
          headers: {
            'Authorization': `Bearer ${user?.id}`,
            'X-Super-Admin': 'true'
          }
        })
        const result = await response.json()

        if (response.ok) {
          setTeams(result.teams || [])
        } else {
          toast.error(result.error || 'Error al cargar equipos')
        }
      } else {
        const response = await fetch('/api/admin/teams', {
          headers: {
            'Authorization': `Bearer ${user?.id}`
          }
        })
        const result = await response.json()

        if (response.ok) {
          setTeams(result.teams || [])
        } else {
          toast.error(result.error || 'Error al cargar equipos')
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const updateTeamMember = async (teamId: string, memberId: string, teamLeader: boolean, role: string) => {
    if (!user) return

    setUpdatingMember(memberId)

    try {
      const headers: any = {
        'Content-Type': 'application/json',
      }
      
      if (user?.email === 'opaulyc@gmail.com') {
        headers['X-Super-Admin'] = 'true'
      }
      
      const response = await fetch('/api/admin/teams', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          userId: user.id,
          teamId,
          memberId,
          teamLeader,
          role
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        fetchTeams() // Refresh the list
      } else {
        toast.error(result.error || 'Error al actualizar miembro')
      }
    } catch (error) {
      console.error('Error updating team member:', error)
      toast.error('Error de conexión')
    } finally {
      setUpdatingMember(null)
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
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">{status}</Badge>
    }
  }

  const getRoleIcon = (role: string, teamLeader: boolean) => {
    if (teamLeader) return <Crown className="w-4 h-4 text-yellow-600" />
    if (role === 'lider') return <Users className="w-4 h-4 text-blue-600" />
    return <User className="w-4 h-4 text-slate-600" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestión de Equipos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-slate-200 rounded w-48"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                        <div className="h-3 bg-slate-200 rounded w-24"></div>
                      </div>
                      <div className="h-6 bg-slate-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gestión de Equipos ({teams.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {teams.map((team) => (
          <div key={team.id} className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold">{team.name}</h3>
              <p className="text-sm text-slate-600">{team.description}</p>
              <p className="text-xs text-slate-500">
                Creado el {formatDate(team.created_at)}
              </p>
            </div>
            
            <div className="space-y-3">
              {team.team_members.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No hay miembros en este equipo</p>
              ) : (
                team.team_members.map((member) => (
                  <div key={member.profile_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(member.role, member.team_leader)}
                      <div>
                        <p className="font-medium">
                          {member.profiles.nombre} {member.profiles.apellido1}
                          {member.profiles.apellido2 && ` ${member.profiles.apellido2}`}
                        </p>
                        <p className="text-sm text-slate-600">{member.profiles.email}</p>
                        <p className="text-xs text-slate-500">
                          Se unió el {formatDate(member.joined_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {getStatusBadge(member.status)}
                      
                      {member.status === 'approved' && (
                        <>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={member.team_leader}
                              onCheckedChange={(checked) => 
                                updateTeamMember(team.id, member.profile_id, checked as boolean, member.role)
                              }
                              disabled={updatingMember === member.profile_id}
                            />
                            <span className="text-sm">Líder</span>
                          </div>
                          
                          <Select
                            value={member.role}
                            onValueChange={(value) => 
                              updateTeamMember(team.id, member.profile_id, member.team_leader, value)
                            }
                            disabled={updatingMember === member.profile_id}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="miembro">Miembro</SelectItem>
                              <SelectItem value="lider">Líder</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
