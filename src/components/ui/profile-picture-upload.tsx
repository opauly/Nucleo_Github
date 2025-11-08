"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, User } from 'lucide-react'

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null
  onImageChange: (file: File | null, tempUrl?: string) => void
  disabled?: boolean
  className?: string
}

export function ProfilePictureUpload({
  currentImageUrl,
  onImageChange,
  disabled = false,
  className = ""
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update preview when currentImageUrl changes
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null)
  }, [currentImageUrl])

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const tempUrl = URL.createObjectURL(file)
      setPreviewUrl(tempUrl)
      onImageChange(file, tempUrl)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Foto de Perfil
      </label>
      
      <div className="flex items-center gap-4">
        {/* Profile Picture Display/Upload Area */}
        <div
          className={`relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed cursor-pointer transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-slate-300 hover:border-slate-400'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveImage()
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <User className="w-8 h-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        {!disabled && (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClick}
              disabled={disabled}
            >
              <Camera className="w-4 h-4 mr-2" />
              Subir Foto
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                disabled={disabled}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Remover
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Help Text */}
      <p className="text-xs text-slate-500">
        Arrastra una imagen aquí o haz clic para seleccionar. Formatos: JPG, PNG, GIF. Máximo 5MB.
      </p>
    </div>
  )
}
