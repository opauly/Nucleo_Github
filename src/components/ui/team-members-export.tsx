"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, FileSpreadsheet, FileText, Users, Loader2, Check, X, Clock, Crown, User } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { toast } from 'sonner'

interface TeamMembersExportProps {
  teamId: string
  teamName: string
}

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
    apellido2?: string | null
    email: string
    phone?: string
    role: string
  } | null
}

export function TeamMembersExport({ teamId, teamName }: TeamMembersExportProps) {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  useEffect(() => {
    if (user) {
      fetchMembers()
    }
  }, [user, teamId])

  const fetchMembers = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/teams/${teamId}/members`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setMembers(result.members || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Error fetching members:', errorData)
        toast.error(errorData.details || errorData.error || 'Error al cargar la lista de miembros')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para exportar')
      return
    }

    setExporting('excel')
    try {
      const response = await fetch(`/api/admin/teams/${teamId}/members/export/excel`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `miembros_${teamName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Archivo Excel descargado exitosamente')
      } else {
        const result = await response.json()
        toast.error(result.error || 'Error al exportar a Excel')
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('Error al exportar a Excel')
    } finally {
      setExporting(null)
    }
  }

  const handleExportPDF = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para exportar')
      return
    }

    setExporting('pdf')
    try {
      const response = await fetch(`/api/admin/teams/${teamId}/members/export/pdf`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `miembros_${teamName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Archivo PDF descargado exitosamente')
      } else {
        const result = await response.json()
        toast.error(result.error || 'Error al exportar a PDF')
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      toast.error('Error al exportar a PDF')
    } finally {
      setExporting(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <X className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        )
      case 'pending':
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Lista de Miembros
          <Badge variant="secondary" className="ml-2">
            {members.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={exporting !== null || members.length === 0}
            className="w-full"
            size="sm"
          >
            {exporting === 'excel' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Exportando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                <span className="text-xs sm:text-sm">Excel</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={exporting !== null || members.length === 0}
            className="w-full"
            size="sm"
          >
            {exporting === 'pdf' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Exportando...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-xs sm:text-sm">PDF</span>
              </>
            )}
          </Button>
        </div>

        {members.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {members.map((member, index) => {
                const hasProfile = member.profiles !== null
                return (
                  <div
                    key={member.profile_id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {hasProfile ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-slate-900">
                                {index + 1}. {member.profiles?.nombre || ''} {member.profiles?.apellido1 || ''} {member.profiles?.apellido2 || ''}
                              </p>
                              {member.team_leader && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Líder
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{member.profiles?.email || 'Sin email'}</p>
                            {member.profiles?.phone && (
                              <p className="text-xs text-slate-500">{member.profiles.phone}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                              Se unió: {new Date(member.joined_at).toLocaleDateString('es-ES')}
                            </p>
                            <p className="text-xs text-slate-500">
                              Rol: {member.role === 'lider' ? 'Líder' : 'Miembro'}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-slate-900">
                              {index + 1}. Perfil no disponible
                            </p>
                            <p className="text-sm text-slate-500">ID de miembro: {member.profile_id}</p>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {getStatusBadge(member.status)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-4">
            No hay miembros registrados aún.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

