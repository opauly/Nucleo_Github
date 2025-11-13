"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ConfirmarContrasenaPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('loading')
  const [message, setMessage] = useState('')
  const [isValidToken, setIsValidToken] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (!supabase) {
      setStatus('error')
      setMessage('Error de conexión')
      return
    }

    // Set up auth state listener to catch when session is established
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (session) {
          setIsValidToken(true)
          setStatus('idle')
        }
      }
    })

    // Also check for existing session
    const checkSession = async () => {
      // Wait a bit for Supabase to process the URL hash
      await new Promise(resolve => setTimeout(resolve, 500))

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
      }

      if (session) {
        setIsValidToken(true)
        setStatus('idle')
      } else {
        // Check if there's a hash in the URL (Supabase redirects with hash)
        const hash = window.location.hash
        const searchParams = new URLSearchParams(window.location.search)
        
        // Check for access_token or code in hash or query params
        const hasToken = hash.includes('access_token') || 
                        hash.includes('type=recovery') ||
                        hash.includes('recovery') ||
                        searchParams.has('access_token') ||
                        searchParams.has('code')

        if (hasToken) {
          // Wait a bit more and check again - Supabase might still be processing
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          
          if (retrySession) {
            setIsValidToken(true)
            setStatus('idle')
          } else {
            setStatus('error')
            setMessage('El enlace de recuperación no es válido o ha expirado. Por favor solicita uno nuevo.')
          }
        } else {
          setStatus('error')
          setMessage('No se encontró un enlace de recuperación válido. Por favor solicita uno nuevo.')
        }
      }
    }

    checkSession()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.password || !formData.confirmPassword) {
      setMessage('Por favor completa todos los campos')
      return false
    }

    if (formData.password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Las contraseñas no coinciden')
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

    if (!supabase) {
      setStatus('error')
      setMessage('Error de conexión')
      return
    }

    setIsSubmitting(true)
    setStatus('idle')
    setMessage('')

    try {
      // First, ensure we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('No se encontró una sesión válida. Por favor solicita un nuevo enlace de recuperación.')
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        throw error
      }

      setStatus('success')
      setMessage('Tu contraseña ha sido restablecida exitosamente.')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/iniciar-sesion')
      }, 2000)
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Error al restablecer la contraseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20 flex items-center justify-center">
        <Card className="shadow-lg max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">Verificando enlace de recuperación...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          <img
            src="/img/login-hero.jpg"
            alt="Confirmar nueva contraseña"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Nueva Contraseña
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Ingresa tu nueva contraseña
            </p>
          </div>
        </div>
      </section>

      {/* Reset Form */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 text-center flex items-center justify-center gap-2">
                  <Lock className="w-6 h-6" />
                  Establecer Nueva Contraseña
                </CardTitle>
              </CardHeader>
              <CardContent>
                {status === 'success' ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Contraseña restablecida</p>
                        <p className="text-sm">{message}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-600 text-sm mb-4">
                        Serás redirigido a la página de inicio de sesión...
                      </p>
                      <Link href="/iniciar-sesion">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Ir a Iniciar Sesión
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : !isValidToken ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Enlace inválido</p>
                        <p className="text-sm">{message}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Link href="/recuperar-contrasena">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Solicitar Nuevo Enlace
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Message */}
                    {status === 'error' && (
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <span>{message}</span>
                      </div>
                    )}

                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pr-10"
                          placeholder="Mínimo 6 caracteres"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pr-10"
                          placeholder="Confirma tu contraseña"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                    >
                      {isSubmitting ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </Button>

                    {/* Links */}
                    <div className="text-center">
                      <Link href="/iniciar-sesion" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Volver a Iniciar Sesión
                      </Link>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

