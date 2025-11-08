"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ImageUpload, ImageDisplay, FeaturedImageUpload } from '@/components/ui/image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth/auth-context'
import { toast } from 'sonner'
import { Save, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AnnouncementFormProps {
  announcement?: {
    id: string
    title: string
    summary?: string
    content: string
    image_url?: string
    published_at?: string
    is_featured?: boolean
    created_at: string
    updated_at: string
  }
  onSave?: () => void
  onCancel?: () => void
}

export function AnnouncementForm({ announcement, onSave, onCancel }: AnnouncementFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState(announcement?.title || '')
  const [summary, setSummary] = useState(announcement?.summary || '')
  const [content, setContent] = useState(announcement?.content || '')
  const [status, setStatus] = useState(announcement?.published_at ? 'published' : 'draft')
  const [isFeatured, setIsFeatured] = useState(announcement?.is_featured || false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<Array<{ file: File; tempUrl: string }>>([])
  const [featuredImage, setFeaturedImage] = useState<{ file: File; tempUrl: string } | null>(null)

  const isEditing = !!announcement

  const handleSave = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear contenido')
      return
    }

    if (!title.trim()) {
      toast.error('El título es requerido')
      return
    }

    if (!summary.trim()) {
      toast.error('El resumen es requerido')
      return
    }

    if (!content.trim()) {
      toast.error('El contenido es requerido')
      return
    }

    setIsLoading(true)

    try {
      let finalContent = content
      let featuredImageUrl = announcement?.image_url || null

      // Upload featured image if there's a new one
      if (featuredImage) {
        const formData = new FormData()
        formData.append('file', featuredImage.file)
        formData.append('folder', 'announcements')

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

      // Upload content images if there are any
      if (uploadedImages.length > 0) {
        for (const imageData of uploadedImages) {
          const formData = new FormData()
          formData.append('file', imageData.file)
          formData.append('folder', 'announcements')

          const uploadResponse = await fetch('/api/admin/upload-image', {
            method: 'POST',
            body: formData
          })

          const uploadResult = await uploadResponse.json()

          if (uploadResponse.ok && uploadResult.success) {
            finalContent = finalContent.replace(imageData.tempUrl, uploadResult.url)
          } else {
            console.error('Image upload error:', uploadResult.error)
            toast.error(`Error al subir imagen: ${uploadResult.error}`)
            setIsLoading(false)
            return
          }
        }
      }

      const url = isEditing 
        ? `/api/admin/announcements/${announcement.id}`
        : '/api/admin/announcements'
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          content: finalContent.trim(),
          status,
          is_featured: isFeatured,
          image_url: featuredImageUrl,
          author_id: user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(isEditing ? 'Anuncio actualizado exitosamente' : 'Anuncio creado exitosamente')
        if (onSave) {
          onSave()
        } else {
          router.push('/admin/content/announcements')
        }
      } else {
        toast.error(result.error || 'Error al guardar el anuncio')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUploaded = (file: File, tempUrl: string) => {
    setUploadedImages(prev => [...prev, { file, tempUrl }])
    const imageTag = `<img src="${tempUrl}" alt="Uploaded image" style="max-width: 100%; height: auto;" data-temp-file="${file.name}" />`
    setContent(prev => prev + imageTag)
    toast.success('Imagen agregada al contenido (preview)')
  }

  const handleRemoveImage = (index: number) => {
    const imageToRemove = uploadedImages[index]
    URL.revokeObjectURL(imageToRemove.tempUrl)
    
    // Remove the image from the content
    const imageTag = `<img src="${imageToRemove.tempUrl}" alt="Uploaded image" style="max-width: 100%; height: auto;" data-temp-file="${imageToRemove.file.name}" />`
    setContent(prev => prev.replace(imageTag, ''))
    
    // Remove from uploaded images array
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    toast.success('Imagen removida del contenido')
  }

  const handleFeaturedImageUploaded = (file: File, tempUrl: string) => {
    setFeaturedImage({ file, tempUrl })
  }

  const handleRemoveFeaturedImage = () => {
    setFeaturedImage(null)
  }

  const handleContentChange = (newContent: string) => {
    let finalContent = newContent
    uploadedImages.forEach(imageData => {
      const imageTag = `<img src="${imageData.tempUrl}" alt="Uploaded image" style="max-width: 100%; height: auto;" data-temp-file="${imageData.file.name}" />`
      if (!finalContent.includes(imageData.tempUrl)) {
        finalContent += imageTag // Re-add if missing
      }
    })
    setContent(finalContent)
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
    if (!announcement) return

    if (!confirm('¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Anuncio eliminado exitosamente')
        router.push('/admin/content/announcements')
      } else {
        const result = await response.json()
        toast.error(result.error || 'Error al eliminar el anuncio')
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
              {isEditing ? 'Editar Anuncio' : 'Nuevo Anuncio'}
            </h1>
            <p className="text-slate-600">
              {isEditing ? 'Modifica el contenido del anuncio' : 'Crea un nuevo anuncio para la comunidad'}
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
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título del anuncio..."
              className="text-lg"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Resumen *</Label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Escribe un resumen breve del anuncio (se mostrará en las tarjetas de vista previa)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-slate-500">{summary.length}/200 caracteres</p>
          </div>

          {/* Status */}
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

          {/* Featured Toggle */}
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
              Los anuncios destacados aparecerán en la página principal del sitio
            </p>
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <Label>Contenido *</Label>
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Escribe el contenido del anuncio aquí..."
              className="min-h-[400px]"
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
              <CardTitle className="text-lg">Imagen Destacada</CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturedImageUpload
                onImageUploaded={handleFeaturedImageUploaded}
                currentImageUrl={announcement?.image_url}
                onRemoveImage={handleRemoveFeaturedImage}
              />
            </CardContent>
          </Card>

          {/* Content Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Imágenes del Contenido</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                folder="announcements"
                description="Agrega imágenes al contenido del anuncio"
              />
              <ImageDisplay
                images={uploadedImages}
                onRemoveImage={handleRemoveImage}
                className="mt-4"
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
                  <h1 className="text-xl font-bold mb-4">{title || 'Título del Anuncio'}</h1>
                  {(featuredImage?.tempUrl || announcement?.image_url) && (
                    <div className="mb-4">
                      <img
                        src={featuredImage?.tempUrl || announcement?.image_url}
                        alt="Imagen destacada"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div 
                    className="text-sm text-slate-600"
                    dangerouslySetInnerHTML={{ __html: content || '<p>Contenido del anuncio...</p>' }}
                  />
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Estado: {getStatusBadge(status)}
                    </p>
                    {isEditing && (
                      <p className="text-xs text-slate-500">
                        Última actualización: {new Date(announcement.updated_at).toLocaleDateString('es-ES')}
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
                <p className="text-sm font-medium text-slate-700">Autor</p>
                <p className="text-sm text-slate-600">
                  {user?.email || 'Usuario actual'}
                </p>
              </div>
              
              {isEditing && (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Creado</p>
                    <p className="text-sm text-slate-600">
                      {new Date(announcement.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Actualizado</p>
                    <p className="text-sm text-slate-600">
                      {new Date(announcement.updated_at).toLocaleDateString('es-ES')}
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
