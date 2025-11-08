"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, FileSpreadsheet, FileText, Users, Loader2, Check, X, Clock } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { toast } from 'sonner'

interface EventAttendeesExportProps {
  eventId: string
  eventTitle: string
}

interface Attendee {
  id: string
  status: string
  notes?: string
  created_at: string
  profiles: {
    id: string
    nombre: string
    apellido1: string
    apellido2?: string
    email: string
    phone?: string
  } | null
}

export function EventAttendeesExport({ eventId, eventTitle }: EventAttendeesExportProps) {
  const { user } = useAuth()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      checkSuperAdmin()
    }
  }, [user])

  useEffect(() => {
    if (user && (isSuperAdmin || hasAccess === true)) {
      fetchAttendees()
    } else if (user && !isSuperAdmin) {
      checkAccess()
    }
  }, [user, eventId, isSuperAdmin, hasAccess])

  const checkSuperAdmin = async () => {
    if (!user) return
    
    // Check if user is super admin (opaulyc@gmail.com or via API)
    if (user.email === 'opaulyc@gmail.com') {
      setIsSuperAdmin(true)
      setHasAccess(true) // Super admins always have access
      return
    }

    try {
      const response = await fetch('/api/admin/debug-user-role', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': 'true'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.user?.super_admin) {
          setIsSuperAdmin(true)
          setHasAccess(true) // Super admins always have access
        }
      }
    } catch (error) {
      console.error('Error checking super admin status:', error)
    }
  }

  const checkAccess = async () => {
    if (!user || isSuperAdmin) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}/attendees`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': 'true'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setHasAccess(true)
        setAttendees(result.attendees || [])
      } else {
        setHasAccess(false)
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setHasAccess(false)
    }
  }

  const fetchAttendees = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/events/${eventId}/attendees`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': 'true'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setAttendees(result.attendees || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Error fetching attendees:', errorData)
        console.error('Response status:', response.status)
        toast.error(errorData.details || errorData.error || 'Error al cargar la lista de asistentes')
      }
    } catch (error) {
      console.error('Error fetching attendees:', error)
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
      const response = await fetch(`/api/events/${eventId}/attendees/export/excel`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': 'true'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `asistentes_${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`
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
      const response = await fetch(`/api/events/${eventId}/attendees/export/pdf`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': 'true'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `asistentes_${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`
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

  const handleStatusChange = async (registrationId: string, action: 'approve' | 'reject' | 'pending') => {
    if (!user) {
      toast.error('Debes iniciar sesión para cambiar el estado')
      return
    }

    setProcessingId(registrationId)
    try {
      const response = await fetch('/api/events/approve-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId,
          action,
          adminUserId: user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        const actionMessages: Record<string, string> = {
          'approve': 'aprobado',
          'reject': 'rechazado',
          'pending': 'marcado como pendiente'
        }
        toast.success(result.message || `Registro ${actionMessages[action] || 'actualizado'} exitosamente`)
        // Refresh the attendees list
        fetchAttendees()
      } else {
        toast.error(result.error || 'Error al cambiar el estado')
      }
    } catch (error) {
      console.error('Error changing status:', error)
      toast.error('Error de conexión')
    } finally {
      setProcessingId(null)
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

  // Show loading state while checking access or fetching attendees
  if ((hasAccess === null && !isSuperAdmin) || loading) {
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

  // Hide if no access and not super admin
  if (hasAccess === false && !isSuperAdmin) {
    return null
  }

  // Always show for super admins, or if hasAccess is true
  if (!isSuperAdmin && hasAccess !== true) {
    return null
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Lista de Asistentes
          <Badge variant="secondary" className="ml-2">
            {attendees.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={exporting !== null || attendees.length === 0}
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
            disabled={exporting !== null || attendees.length === 0}
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

        {attendees.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {attendees.map((attendee, index) => {
                const hasProfile = attendee.profiles !== null
                const isProcessing = processingId === attendee.id
                return (
                  <div
                    key={attendee.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {hasProfile ? (
                          <>
                            <p className="font-medium text-slate-900">
                              {index + 1}. {attendee.profiles?.nombre || ''} {attendee.profiles?.apellido1 || ''} {attendee.profiles?.apellido2 || ''}
                            </p>
                            <p className="text-sm text-slate-600">{attendee.profiles?.email || 'Sin email'}</p>
                            {attendee.profiles?.phone && (
                              <p className="text-xs text-slate-500">{attendee.profiles.phone}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="font-medium text-slate-900">
                              {index + 1}. Perfil no disponible
                            </p>
                            <p className="text-sm text-slate-500">ID de registro: {attendee.id}</p>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {getStatusBadge(attendee.status)}
                        <div className="flex gap-2 mt-1 flex-wrap justify-end">
                          {attendee.status !== 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              onClick={() => handleStatusChange(attendee.id, 'approve')}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Aprobar
                                </>
                              )}
                            </Button>
                          )}
                          {attendee.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              onClick={() => handleStatusChange(attendee.id, 'reject')}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <X className="w-3 h-3 mr-1" />
                                  Rechazar
                                </>
                              )}
                            </Button>
                          )}
                          {attendee.status !== 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                              onClick={() => handleStatusChange(attendee.id, 'pending')}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pendiente
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-4">
            No hay asistentes registrados aún.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
