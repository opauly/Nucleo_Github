"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { FeaturedImageUpload } from '@/components/ui/image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth/auth-context'
import { toast } from 'sonner'
import { Save, Eye, EyeOff, ArrowLeft, Calendar, MapPin, Users, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EventFormProps {
  event?: {
    id: string
    title: string
    description?: string
    start_date: string
    end_date?: string
    location?: string
    image_url?: string
    max_participants?: number
    status?: string
    is_featured?: boolean
    team_id?: string
    created_at: string
    updated_at: string
  }
  onSave?: () => void
  onCancel?: () => void
}

export function EventForm({ event, onSave, onCancel }: EventFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startDate, setStartDate] = useState(event?.start_date ? event.start_date.slice(0, 16) : '')
  const [endDate, setEndDate] = useState(event?.end_date ? event.end_date.slice(0, 16) : '')
  const [location, setLocation] = useState(event?.location || '')
  const [maxParticipants, setMaxParticipants] = useState(event?.max_participants?.toString() || '')
  const [status, setStatus] = useState(event?.status || 'draft')
  const [isFeatured, setIsFeatured] = useState(event?.is_featured || false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<{ file: File; tempUrl: string } | null>(null)
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>(event?.team_id ? [event.team_id] : [])
  const [loadingTeams, setLoadingTeams] = useState(true)

  const isEditing = !!event

  // Fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) {
        setLoadingTeams(false)
        return
      }

      try {
        const response = await fetch('/api/admin/teams', {
          headers: {
            'Authorization': `Bearer ${user.id}`,
            'x-super-admin': 'true' // Bypass admin check for super admin
          }
        })
        const result = await response.json()
        
        if (response.ok && result.success) {
          setTeams(result.teams || [])
        } else {
          console.error('Error fetching teams:', result.error)
          toast.error('Error al cargar los equipos')
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
        toast.error('Error de conexión al cargar equipos')
      } finally {
        setLoadingTeams(false)
      }
    }

    fetchTeams()
  }, [user])

  // Load existing team associations for editing
  useEffect(() => {
    if (isEditing && event?.id && user) {
      const fetchEventTeams = async () => {
        try {
          const response = await fetch(`/api/admin/events/${event.id}/teams`, {
            headers: {
              'Authorization': `Bearer ${user.id}`,
              'x-super-admin': 'true'
            }
          })
          const result = await response.json()
          
          if (response.ok && result.success) {
            setSelectedTeams(result.teams.map((t: any) => t.team_id))
          }
        } catch (error) {
          console.error('Error fetching event teams:', error)
        }
      }

      fetchEventTeams()
    }
  }, [isEditing, event?.id, user])

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }

  const handleSave = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear contenido')
      return
    }

    if (!title.trim()) {
      toast.error('El título es requerido')
      return
    }

    if (!startDate) {
      toast.error('La fecha de inicio es requerida')
      return
    }

    if (endDate && new Date(endDate) <= new Date(startDate)) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio')
      return
    }

    if (maxParticipants && (isNaN(parseInt(maxParticipants)) || parseInt(maxParticipants) <= 0)) {
      toast.error('El número máximo de participantes debe ser un número positivo')
      return
    }

    setIsLoading(true)

    try {
      let featuredImageUrl = event?.image_url || null

      // Upload featured image if there's a new one
      if (featuredImage) {
        const formData = new FormData()
        formData.append('file', featuredImage.file)
        formData.append('folder', 'events')

        const uploadResponse = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData
        })

        const uploadResult = await uploadResponse.json()

        if (uploadResponse.ok && uploadResult.success) {
          featuredImageUrl = uploadResult.url
        } else {
          console.error('Featured image upload error:', uploadResult.error)
          toast.error(`Error al subir imagen destacada: ${uploadResult.error}`)
          setIsLoading(false)
          return
        }
      }

      const url = isEditing 
        ? `/api/admin/events/${event.id}`
        : '/api/admin/events'
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          start_date: startDate,
          end_date: endDate || null,
          location: location.trim() || null,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
          status,
          is_featured: isFeatured,
          image_url: featuredImageUrl,
          created_by: user.id,
          team_ids: selectedTeams
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(isEditing ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente')
        if (onSave) {
          onSave()
        } else {
          router.push('/admin/content/events')
        }
      } else {
        toast.error(result.error || 'Error al guardar el evento')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeaturedImageUploaded = (file: File, tempUrl: string) => {
    setFeaturedImage({ file, tempUrl })
  }

  const handleRemoveFeaturedImage = () => {
    setFeaturedImage(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-600 text-white">Publicado</Badge>
      case 'draft':
        return <Badge className="bg-slate-600 text-white">Borrador</Badge>
      default:
        return <Badge className="bg-slate-600 text-white">Borrador</Badge>
    }
  }

  const handleDelete = async () => {
    if (!event) return

    if (!confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Evento eliminado exitosamente')
        router.push('/admin/content/events')
      } else {
        const result = await response.json()
        toast.error(result.error || 'Error al eliminar el evento')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
            </h1>
            <p className="text-slate-600">
              {isEditing ? 'Modifica la información del evento' : 'Crea un nuevo evento para la comunidad'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing && getStatusBadge(status)}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título del Evento *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título del evento..."
              className="text-lg"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha y Hora de Inicio *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha y Hora de Fin</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Location and Max Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ingresa la ubicación del evento..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Máximo de Participantes</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={maxParticipants}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || (!isNaN(parseInt(value)) && parseInt(value) > 0)) {
                      setMaxParticipants(value)
                    }
                  }}
                  placeholder="Sin límite"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Status and Featured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <Label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">
                  Destacar en la página principal
                </Label>
              </div>
              <p className="text-xs text-slate-500">
                Los eventos destacados aparecerán en la página principal del sitio
              </p>
            </div>
          </div>

          {/* Team Selection */}
          <div className="space-y-2">
            <Label>Equipos Responsables</Label>
            <p className="text-sm text-slate-600">
              Selecciona los equipos que son responsables de este evento. Si no seleccionas ningún equipo, el evento será público para todos.
            </p>
            {loadingTeams ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-slate-600">Cargando equipos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`team-${team.id}`}
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => handleTeamToggle(team.id)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <Label 
                      htmlFor={`team-${team.id}`} 
                      className="text-sm font-medium text-slate-700 cursor-pointer flex-1"
                    >
                      {team.name}
                    </Label>
                  </div>
                ))}
                {teams.length === 0 && (
                  <div className="col-span-full text-center py-4 text-slate-500">
                    No hay equipos disponibles
                  </div>
                )}
              </div>
            )}
            {selectedTeams.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <UserCheck className="w-4 h-4" />
                <span>
                  {selectedTeams.length} equipo{selectedTeams.length > 1 ? 's' : ''} seleccionado{selectedTeams.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descripción del Evento</Label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Describe el evento, incluye detalles importantes, agenda, etc..."
              className="min-h-[300px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </Button>
            
            {isEditing && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Eliminar
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imagen del Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturedImageUpload
                onImageUploaded={handleFeaturedImageUploaded}
                currentImageUrl={event?.image_url}
                onRemoveImage={handleRemoveFeaturedImage}
              />
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <h1 className="text-xl font-bold mb-4">{title || 'Título del Evento'}</h1>
                  {(featuredImage?.tempUrl || event?.image_url) && (
                    <div className="mb-4">
                      <img
                        src={featuredImage?.tempUrl || event?.image_url}
                        alt="Imagen del evento"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        <strong>Inicio:</strong> {startDate ? new Date(startDate).toLocaleString('es-ES') : 'Por definir'}
                      </span>
                    </div>
                    {endDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <strong>Fin:</strong> {new Date(endDate).toLocaleString('es-ES')}
                        </span>
                      </div>
                    )}
                    {location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span><strong>Ubicación:</strong> {location}</span>
                      </div>
                    )}
                    {maxParticipants && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span><strong>Máximo:</strong> {maxParticipants} participantes</span>
                      </div>
                    )}
                  </div>
                  <div 
                    className="mt-4 text-sm text-slate-600"
                    dangerouslySetInnerHTML={{ __html: description || '<p>Descripción del evento...</p>' }}
                  />
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Estado: {getStatusBadge(status)}
                    </p>
                    {isEditing && (
                      <p className="text-xs text-slate-500">
                        Última actualización: {new Date(event.updated_at).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Creado por</p>
                <p className="text-sm text-slate-600">
                  {user?.email || 'Usuario actual'}
                </p>
              </div>
              
              {isEditing && (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Creado</p>
                    <p className="text-sm text-slate-600">
                      {new Date(event.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Actualizado</p>
                    <p className="text-sm text-slate-600">
                      {new Date(event.updated_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
