"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AttendanceCounter } from '@/components/admin/attendance-counter'
import { toast } from 'sonner'
import { Calendar, Save, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUserRole } from '@/lib/auth/role-auth'

export default function AttendancePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<any>(null)
  const [checkingRole, setCheckingRole] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [adults, setAdults] = useState(0)
  const [teens, setTeens] = useState(0)
  const [kids, setKids] = useState(0)
  const [attendanceDate, setAttendanceDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [notes, setNotes] = useState('')
  const [lastRecord, setLastRecord] = useState<any>(null)

  useEffect(() => {
    if (user) {
      checkUserRole()
      fetchLastRecord()
    } else if (!authLoading) {
      router.push('/iniciar-sesion')
    }
  }, [user, authLoading, router])

  const checkUserRole = async () => {
    if (!user) return

    try {
      const role = await getUserRole(user.id)
      setUserRole(role)
      
      // Check if user is Staff or above
      if (role && (role.role === 'Staff' || role.role === 'Admin' || role.super_admin)) {
        // User has access
      } else {
        router.push('/admin')
        toast.error('No tienes permisos para acceder a esta página')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      router.push('/admin')
    } finally {
      setCheckingRole(false)
    }
  }

  const fetchLastRecord = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/admin/attendance?limit=1', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.records && result.records.length > 0) {
          setLastRecord(result.records[0])
        }
      }
    } catch (error) {
      console.error('Error fetching last record:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    try {
      const headers: any = {
        'Content-Type': 'application/json',
      }
      
      if (user?.email === 'opaulyc@gmail.com') {
        headers['x-super-admin'] = 'true'
      }

      const response = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: {
          ...headers,
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          attendance_date: attendanceDate,
          adults_count: adults,
          teens_count: teens,
          kids_count: kids,
          notes: notes.trim() || null
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Asistencia registrada exitosamente')
        // Reset form
        setAdults(0)
        setTeens(0)
        setKids(0)
        setNotes('')
        // Refresh last record
        fetchLastRecord()
      } else {
        if (response.status === 409) {
          toast.error('Ya existe un registro para esta fecha. Por favor, actualiza el registro existente.')
        } else {
          toast.error(result.error || 'Error al registrar asistencia')
        }
      }
    } catch (error) {
      console.error('Error submitting attendance:', error)
      toast.error('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const total = adults + teens + kids

  if (authLoading || checkingRole) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!userRole || (userRole.role !== 'Staff' && userRole.role !== 'Admin' && !userRole.super_admin)) {
    return null
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Panel
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Registro de Asistencia</h1>
        <p className="text-slate-600">Registra la asistencia del servicio dominical</p>
      </div>

      {/* Last Record Info */}
      {lastRecord && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span>
                Último registro: {new Date(lastRecord.attendance_date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} - Total: {lastRecord.total_count} personas
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Date Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Fecha del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="attendance-date">Fecha</Label>
                <Input
                  id="attendance-date"
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-xs text-slate-500">
                  Selecciona la fecha del servicio (no se permiten fechas futuras)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Counters */}
          <Card>
            <CardHeader>
              <CardTitle>Contadores de Asistencia</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceCounter
                adults={adults}
                teens={teens}
                kids={kids}
                onAdultsChange={setAdults}
                onTeensChange={setTeens}
                onKidsChange={setKids}
              />
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-900">Total:</span>
                  <span className="text-3xl font-bold text-slate-900">{total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notas (Opcional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agrega notas adicionales sobre el servicio..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting || total === 0}
              className="min-w-32"
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Asistencia
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

