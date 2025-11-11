"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { getUserRole } from '@/lib/auth/role-auth'
import { toast } from 'sonner'
import { ArrowLeft, Upload, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function ImportAttendancePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<any>(null)
  const [checkingRole, setCheckingRole] = useState(true)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [overrideExisting, setOverrideExisting] = useState(true)

  useEffect(() => {
    if (user) {
      checkUserRole()
    } else if (!authLoading) {
      router.push('/iniciar-sesion')
    }
  }, [user, authLoading, router])

  const checkUserRole = async () => {
    if (!user) return

    try {
      const role = await getUserRole(user.id)
      setUserRole(role)
      
      // Check if user is Admin or above
      if (role && (role.role === 'Admin' || role.super_admin)) {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file)
        setResult(null)
      } else {
        toast.error('Por favor selecciona un archivo CSV')
        e.target.value = ''
      }
    }
  }

  const handleImport = async () => {
    if (!user) {
      toast.error('Debes estar autenticado para importar datos')
      return
    }

    if (!csvFile) {
      toast.error('Por favor selecciona un archivo CSV')
      return
    }

    setImporting(true)
    setResult(null)

    try {
      // Read CSV file content
      const csvContent = await csvFile.text()

      const headers: any = {
        'Authorization': `Bearer ${user.id}`
      }
      
      if (user?.email === 'opaulyc@gmail.com') {
        headers['x-super-admin'] = 'true'
      }

      // Create FormData to send file content
      const formData = new FormData()
      formData.append('csvContent', csvContent)
      formData.append('overrideExisting', overrideExisting.toString())

      const response = await fetch('/api/admin/attendance/import', {
        method: 'POST',
        headers,
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        toast.success('Importación completada exitosamente')
        // Reset file input
        setCsvFile(null)
        const fileInput = document.getElementById('csv-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        toast.error(data.error || 'Error al importar datos')
        setResult({ error: data.error || 'Error desconocido' })
      }
    } catch (error) {
      console.error('Error importing attendance:', error)
      toast.error('Error de conexión')
      setResult({ error: 'Error de conexión' })
    } finally {
      setImporting(false)
    }
  }

  if (authLoading || checkingRole) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="h-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!userRole || (userRole.role !== 'Admin' && !userRole.super_admin)) {
    return null
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/attendance">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Importar Asistencia Histórica</h1>
        <p className="text-slate-600">Importa registros de asistencia desde un archivo CSV</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importar Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-slate-600">
              Selecciona un archivo CSV con los registros de asistencia histórica.
            </p>
            <p className="text-sm text-slate-500">
              El archivo debe tener columnas: Fecha, Adultos, Niños, Personas nuevas, Bebés, Teens
            </p>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="csv-file" className="text-sm font-medium">
              Archivo CSV
            </Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="csv-file"
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">
                  {csvFile ? csvFile.name : 'Seleccionar archivo CSV'}
                </span>
              </label>
              <input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={importing}
              />
              {csvFile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCsvFile(null)
                    const fileInput = document.getElementById('csv-file') as HTMLInputElement
                    if (fileInput) fileInput.value = ''
                  }}
                  disabled={importing}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Override Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="override-existing"
              checked={overrideExisting}
              onCheckedChange={(checked) => setOverrideExisting(checked === true)}
              disabled={importing}
            />
            <Label
              htmlFor="override-existing"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Sobrescribir registros existentes
            </Label>
          </div>
          <p className="text-xs text-slate-500">
            {overrideExisting
              ? 'Los registros existentes para las mismas fechas serán actualizados con los nuevos valores.'
              : 'Los registros existentes serán ignorados. Solo se insertarán registros nuevos.'}
          </p>

          <Button
            onClick={handleImport}
            disabled={importing || !csvFile}
            className="w-full md:w-auto"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Iniciar Importación
              </>
            )}
          </Button>

          {result && (
            <div className={`mt-6 p-4 rounded-lg border ${
              result.error 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              {result.error ? (
                <div className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="text-red-700">{result.error}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900">Importación Completada</h3>
                      <p className="text-green-700">{result.message}</p>
                    </div>
                  </div>
                  
                  {result.summary && (
                    <div className="mt-4 space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Total</p>
                          <p className="text-lg font-bold text-slate-900">{result.summary.total}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Actualizados</p>
                          <p className="text-lg font-bold text-green-600">{result.summary.updated}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Insertados</p>
                          <p className="text-lg font-bold text-blue-600">{result.summary.inserted}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Errores</p>
                          <p className="text-lg font-bold text-red-600">{result.summary.errors}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                      <p className="text-sm font-semibold text-red-900 mb-2">Errores encontrados:</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {result.errors.map((error: string, index: number) => (
                          <p key={index} className="text-xs text-red-700">{error}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

