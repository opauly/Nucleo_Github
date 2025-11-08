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

interface DevotionalFormProps {
  devotional?: {
    id: string
    title: string
    summary?: string
    content: string
    author?: string
    image_url?: string
    published_at?: string
    is_featured?: boolean
    created_at: string
    updated_at: string
  }
  onSave?: () => void
  onCancel?: () => void
}

export function DevotionalForm({ devotional, onSave, onCancel }: DevotionalFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState(devotional?.title || '')
  const [summary, setSummary] = useState(devotional?.summary || '')
  const [author, setAuthor] = useState(devotional?.author || '')
  const [content, setContent] = useState(devotional?.content || '')
  const [status, setStatus] = useState(devotional?.published_at ? 'published' : 'draft')
  const [isFeatured, setIsFeatured] = useState(devotional?.is_featured || false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<Array<{ file: File; tempUrl: string }>>([])
  const [featuredImage, setFeaturedImage] = useState<{ file: File; tempUrl: string } | null>(null)

  const isEditing = !!devotional

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

    if (!author.trim()) {
      toast.error('El autor es requerido')
      return
    }

    if (!content.trim()) {
      toast.error('El contenido es requerido')
      return
    }

    setIsLoading(true)

    try {
      let finalContent = content
      let featuredImageUrl = devotional?.image_url || null

      // Upload featured image if there's a new one
      if (featuredImage) {
        const formData = new FormData()
        formData.append('file', featuredImage.file)
        formData.append('folder', 'devotionals')

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
          formData.append('folder', 'devotionals')

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
        ? `/api/admin/devotionals/${devotional.id}`
        : '/api/admin/devotionals'
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          author: author.trim(),
          content: finalContent.trim(),
          status,
          is_featured: isFeatured,
          image_url: featuredImageUrl,
          author_id: user.id
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(isEditing ? 'Devocional actualizado exitosamente' : 'Devocional creado exitosamente')
        if (onSave) {
          onSave()
        } else {
          router.push('/admin/content/devotionals')
        }
      } else {
        toast.error(result.error || 'Error al guardar el devocional')
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
    if (!devotional) return

    if (!confirm('¿Estás seguro de que quieres eliminar este devocional? Esta acción no se puede deshacer.')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/devotionals/${devotional.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Devocional eliminado exitosamente')
        router.push('/admin/content/devotionals')
      } else {
        const result = await response.json()
        toast.error(result.error || 'Error al eliminar el devocional')
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
              {isEditing ? 'Editar Devocional' : 'Nuevo Devocional'}
            </h1>
            <p className="text-slate-600">
              {isEditing ? 'Modifica el contenido del devocional' : 'Crea un nuevo devocional para la comunidad'}
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
              placeholder="Ingresa el título del devocional..."
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
              placeholder="Escribe un resumen breve del devocional (se mostrará en las tarjetas de vista previa)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-slate-500">{summary.length}/200 caracteres</p>
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">Autor *</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ingresa el nombre del autor..."
              className="text-base"
            />
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
              Los devocionales destacados aparecerán en la página principal del sitio
            </p>
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <Label>Contenido *</Label>
            <RichTextEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Escribe el contenido del devocional aquí..."
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
                currentImageUrl={devotional?.image_url}
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
                folder="devotionals"
                description="Agrega imágenes al contenido del devocional"
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
                  <h1 className="text-xl font-bold mb-2">{title || 'Título del Devocional'}</h1>
                  {author && (
                    <p className="text-sm text-slate-600 mb-2">Por: {author}</p>
                  )}
                  {(featuredImage?.tempUrl || devotional?.image_url) && (
                    <div className="mb-4">
                      <img
                        src={featuredImage?.tempUrl || devotional?.image_url}
                        alt="Imagen destacada"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div 
                    className="text-sm text-slate-600"
                    dangerouslySetInnerHTML={{ __html: content || '<p>Contenido del devocional...</p>' }}
                  />
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Estado: {getStatusBadge(status)}
                    </p>
                    {isEditing && (
                      <p className="text-xs text-slate-500">
                        Última actualización: {new Date(devotional.updated_at).toLocaleDateString('es-ES')}
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
                <p className="text-sm font-medium text-slate-700">Autor del Devocional</p>
                <p className="text-sm text-slate-600">
                  {author || 'No especificado'}
                </p>
              </div>
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
                      {new Date(devotional.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Actualizado</p>
                    <p className="text-sm text-slate-600">
                      {new Date(devotional.updated_at).toLocaleDateString('es-ES')}
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
