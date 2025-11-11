"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LocationSelector } from '@/components/ui/location-selector'
import { PhoneInput } from '@/components/ui/phone-input'
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload'
import { AlertCircle, CheckCircle, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { toast } from 'sonner'

interface AddNewMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onMemberAdded: () => void
}

export function AddNewMemberModal({ isOpen, onClose, onMemberAdded }: AddNewMemberModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    apellido1: '',
    apellido2: '',
    phone: '+506 ',
    birth_date: '',
    provincia: '',
    canton: '',
    distrito: ''
  })
  
  const [profilePicture, setProfilePicture] = useState<{ file: File; tempUrl: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }))
  }

  const handleProfilePictureChange = (file: File | null, tempUrl?: string) => {
    if (file && tempUrl) {
      setProfilePicture({ file, tempUrl })
    } else {
      setProfilePicture(null)
    }
  }

  const validateForm = () => {
    if (!formData.email || !formData.nombre || !formData.apellido1 || !formData.phone || !formData.birth_date || !formData.provincia || !formData.canton || !formData.distrito) {
      setMessage('Todos los campos son obligatorios')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setStatus('error')
      return
    }

    if (!user) {
      setStatus('error')
      setMessage('Debes iniciar sesión para agregar miembros')
      return
    }

    setIsSubmitting(true)
    setStatus('idle')
    setMessage('')

    try {
      // First upload profile picture if provided
      let profilePictureUrl = null
      if (profilePicture?.file) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', profilePicture.file)
        formDataUpload.append('folder', 'profile-pictures')
        
        const uploadResponse = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formDataUpload
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          profilePictureUrl = uploadResult.url
        }
      }

      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        },
        body: JSON.stringify({
          email: formData.email,
          profileData: {
            nombre: formData.nombre,
            apellido1: formData.apellido1,
            apellido2: formData.apellido2,
            phone: formData.phone,
            birth_date: formData.birth_date,
            provincia: formData.provincia,
            canton: formData.canton,
            distrito: formData.distrito,
            profile_picture_url: profilePictureUrl
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('¡Miembro creado exitosamente! Se ha enviado un email de invitación para que configure su contraseña y active su cuenta.')
        onMemberAdded()
        // Reset form after a short delay
        setTimeout(() => {
          handleClose()
        }, 3000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Error al crear el miembro')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Error durante la creación del miembro')
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleClose = () => {
    setFormData({
      email: '',
      nombre: '',
      apellido1: '',
      apellido2: '',
      phone: '+506 ',
      birth_date: '',
      provincia: '',
      canton: '',
      distrito: ''
    })
    setProfilePicture(null)
    setStatus('idle')
    setMessage('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar Nuevo Miembro
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              status === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {status === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full"
              placeholder="tu@email.com"
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500 mt-1">
              El usuario recibirá un email de invitación para configurar su contraseña
            </p>
          </div>

          {/* Profile Picture */}
          <ProfilePictureUpload
            onImageChange={handleProfilePictureChange}
            disabled={isSubmitting}
          />

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">
                Nombre *
              </label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full"
                placeholder="Nombre"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="apellido1" className="block text-sm font-medium text-slate-700 mb-1">
                Primer Apellido *
              </label>
              <Input
                id="apellido1"
                name="apellido1"
                type="text"
                required
                value={formData.apellido1}
                onChange={handleInputChange}
                className="w-full"
                placeholder="Primer apellido"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="apellido2" className="block text-sm font-medium text-slate-700 mb-1">
              Segundo Apellido
            </label>
            <Input
              id="apellido2"
              name="apellido2"
              type="text"
              value={formData.apellido2}
              onChange={handleInputChange}
              className="w-full"
              placeholder="Segundo apellido (opcional)"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Teléfono *
            </label>
            <PhoneInput
              value={formData.phone}
              onChange={handlePhoneChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="birth_date" className="block text-sm font-medium text-slate-700 mb-1">
              Fecha de Nacimiento *
            </label>
            <Input
              id="birth_date"
              name="birth_date"
              type="date"
              required
              value={formData.birth_date}
              onChange={handleInputChange}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          {/* Location */}
          <LocationSelector
            selectedProvincia={formData.provincia}
            selectedCanton={formData.canton}
            selectedDistrito={formData.distrito}
            onProvinciaChange={(provincia) => setFormData({ ...formData, provincia })}
            onCantonChange={(canton) => setFormData({ ...formData, canton })}
            onDistritoChange={(distrito) => setFormData({ ...formData, distrito })}
            disabled={isSubmitting}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Creando miembro...' : 'Crear Miembro'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

