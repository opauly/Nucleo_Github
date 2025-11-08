"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LocationSelector } from '@/components/ui/location-selector'
import { PhoneInput } from '@/components/ui/phone-input'
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload'
import { UserTeams } from '@/components/profile/user-teams'
import { UserEvents } from '@/components/profile/user-events'
import { AlertCircle, CheckCircle, User, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  email: string
  nombre: string
  apellido1: string
  apellido2: string | null
  phone: string
  birth_date: string | null
  provincia: string
  canton: string
  distrito: string
  profile_picture_url: string | null
  role: string
  created_at: string
  updated_at: string
}

export default function PerfilPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const [formData, setFormData] = useState({
    nombre: '',
    apellido1: '',
    apellido2: '',
    phone: '',
    birth_date: '',
    provincia: '',
    canton: '',
    distrito: ''
  })
  
  const [profilePicture, setProfilePicture] = useState<{ file: File; tempUrl: string } | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Don't do anything while still loading
    if (authLoading) {
      return
    }

    // If not loading and no user, redirect to login
    if (!user) {
      router.push('/iniciar-sesion')
      return
    }

    // If we have a user and supabase client, fetch profile
    if (user && supabase) {
      fetchProfile()
    }
  }, [user, authLoading, supabase, router])

  const fetchProfile = async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        throw error
      }

      setProfile(data)
      setFormData({
        nombre: data.nombre || '',
        apellido1: data.apellido1 || '',
        apellido2: data.apellido2 || '',
        phone: data.phone || '',
        birth_date: data.birth_date || '',
        provincia: data.provincia || '',
        canton: data.canton || '',
        distrito: data.distrito || ''
      })
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      setStatus('error')
      setMessage('Error al cargar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSave = async () => {
    if (!user || !supabase) return

    setIsSaving(true)
    setStatus('idle')
    setMessage('')

    try {
      // Upload profile picture if provided
      let profilePictureUrl = profile?.profile_picture_url || null
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

      const { error } = await supabase
        .from('profiles')
        .update({
          nombre: formData.nombre,
          apellido1: formData.apellido1,
          apellido2: formData.apellido2 || null,
          phone: formData.phone,
          birth_date: formData.birth_date || null,
          provincia: formData.provincia,
          canton: formData.canton,
          distrito: formData.distrito,
          profile_picture_url: profilePictureUrl
        })
        .eq('id', user.id)

      if (error) {
        throw error
      }

      setStatus('success')
      setMessage('Perfil actualizado exitosamente')
      setIsEditing(false)
      fetchProfile() // Refresh profile data
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Error al actualizar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {authLoading ? 'Verificando autenticación...' : 'Cargando perfil...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          <img
            src="/img/perfil-hero.jpg"
            alt="Mi perfil"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Mi Perfil
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Gestiona tu información personal y preferencias
            </p>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {status !== 'idle' && (
              <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
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

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-slate-900">
                        Información Personal
                      </CardTitle>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        {isEditing ? 'Cancelar' : 'Editar'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Picture */}
                    <ProfilePictureUpload
                      currentImageUrl={profile?.profile_picture_url}
                      onImageChange={handleProfilePictureChange}
                      disabled={!isEditing}
                    />

                    {/* Name Fields */}
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
                          disabled={!isEditing}
                          value={formData.nombre}
                          onChange={handleInputChange}
                          className="w-full"
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
                          disabled={!isEditing}
                          value={formData.apellido1}
                          onChange={handleInputChange}
                          className="w-full"
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
                        disabled={!isEditing}
                        value={formData.apellido2}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email
                      </label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700">{user.email}</span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                        Teléfono *
                      </label>
                      <PhoneInput
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        required
                        disabled={!isEditing}
                      />
                    </div>

                    {/* Birth Date */}
                    <div>
                      <label htmlFor="birth_date" className="block text-sm font-medium text-slate-700 mb-1">
                        Fecha de Nacimiento *
                      </label>
                      <Input
                        id="birth_date"
                        name="birth_date"
                        type="date"
                        required
                        disabled={!isEditing}
                        value={formData.birth_date}
                        onChange={handleInputChange}
                        className="w-full"
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
                      disabled={!isEditing}
                    />

                    {/* Save Button */}
                    {isEditing && (
                      <div className="flex gap-4">
                        <Button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          disabled={isSaving}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Account Info */}
              <div>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-900">
                      Información de Cuenta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Rol</p>
                        <p className="text-sm text-slate-600">{profile?.role || 'Miembro'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Miembro desde</p>
                        <p className="text-sm text-slate-600">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES') : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
                        Cambiar Contraseña
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teams and Events Section */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                Mi Actividad
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Gestiona tus equipos y eventos registrados
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <UserTeams />
              <UserEvents />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
