"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  onImageUploaded: (file: File, tempUrl: string) => void
  className?: string
  folder?: string
  label?: string
  description?: string
}

interface ImageDisplayProps {
  images: Array<{ file: File; tempUrl: string }>
  onRemoveImage: (index: number) => void
  className?: string
}

export function ImageUpload({ 
  onImageUploaded, 
  className = "", 
  folder = "content-images",
  label = "Imágenes",
  description = "Arrastra una imagen aquí o haz clic para seleccionar"
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }

    handleImagePreview(file)
  }

  const handleImagePreview = (file: File) => {
    const tempUrl = URL.createObjectURL(file)
    onImageUploaded(file, tempUrl)
    toast.success('Imagen agregada al contenido (preview)')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50')
    
    const file = e.dataTransfer.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor arrastra un archivo de imagen válido')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }

    handleImagePreview(file)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="space-y-2">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-400" />
          <div>
            <p className="text-sm text-slate-600">{description}</p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF hasta 5MB</p>
          </div>
        </div>
      </div>
      
      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        Seleccionar Imagen
      </Button>
    </div>
  )
}

export function ImageDisplay({ images, onRemoveImage, className = "" }: ImageDisplayProps) {
  if (images.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-slate-700">Imágenes en el contenido:</h4>
      <div className="grid grid-cols-2 gap-3">
        {images.map((imageData, index) => (
          <div key={index} className="relative group">
            <img
              src={imageData.tempUrl}
              alt={`Imagen ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg border border-slate-200"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Eliminar imagen"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Featured Image Upload Component
export function FeaturedImageUpload({ 
  onImageUploaded, 
  currentImageUrl,
  onRemoveImage,
  className = "" 
}: {
  onImageUploaded: (file: File, tempUrl: string) => void
  currentImageUrl?: string
  onRemoveImage?: () => void
  className?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tempImage, setTempImage] = useState<{ file: File; tempUrl: string } | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }

    const tempUrl = URL.createObjectURL(file)
    setTempImage({ file, tempUrl })
    onImageUploaded(file, tempUrl)
    toast.success('Imagen destacada agregada')
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    if (tempImage) {
      URL.revokeObjectURL(tempImage.tempUrl)
      setTempImage(null)
    }
    onRemoveImage?.()
    toast.success('Imagen destacada removida')
  }

  const displayImage = tempImage?.tempUrl || currentImageUrl

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">Imagen Destacada</h4>
        <p className="text-xs text-slate-500 mb-3">
          Esta imagen aparecerá como portada en las tarjetas de contenido
        </p>
      </div>

      {displayImage ? (
        <div className="relative group">
          <img
            src={displayImage}
            alt="Imagen destacada"
            className="w-full h-48 object-cover rounded-lg border border-slate-200"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar imagen destacada"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="space-y-2">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-400" />
            <div>
              <p className="text-sm text-slate-600">Haz clic para agregar imagen destacada</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF hasta 5MB</p>
            </div>
          </div>
        </div>
      )}

      {!displayImage && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Seleccionar Imagen Destacada
        </Button>
      )}
    </div>
  )
}

