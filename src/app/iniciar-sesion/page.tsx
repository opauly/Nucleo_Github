"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useReCaptcha } from '@/components/ui/recaptcha'

export default function IniciarSesionPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const supabase = createClient()
  const router = useRouter()
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const { getToken } = useReCaptcha(recaptchaSiteKey)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setStatus('error')
      setMessage('Por favor completa todos los campos')
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
      // Verify reCAPTCHA
      if (recaptchaSiteKey) {
        const recaptchaToken = await getToken('login')
        if (!recaptchaToken) {
          setStatus('error')
          setMessage('Error de verificación de seguridad. Por favor intenta nuevamente.')
          setIsSubmitting(false)
          return
        }

        // Verify token with backend
        const verifyResponse = await fetch('/api/auth/verify-recaptcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: recaptchaToken }),
        })

        const verifyResult = await verifyResponse.json()

        if (!verifyResponse.ok || !verifyResult.success) {
          setStatus('error')
          setMessage('Verificación de seguridad fallida. Por favor intenta nuevamente.')
          setIsSubmitting(false)
          return
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Redirect to home page or dashboard
        router.push('/')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Error durante el inicio de sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          <img
            src="/img/login-hero.jpg"
            alt="Iniciar sesión"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Iniciar Sesión
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Accede a tu cuenta y continúa tu camino de fe
            </p>
          </div>
        </div>
      </section>

      {/* Login Form */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 text-center">
                  Acceder a tu Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {status === 'error' && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5" />
                      <span>{message}</span>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email
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
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                      Contraseña
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
                        placeholder="Tu contraseña"
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

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  >
                    {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>

                  {/* Links */}
                  <div className="text-center space-y-2">
                    <p className="text-slate-600">
                      ¿No tienes una cuenta?{' '}
                      <Link href="/registro" className="text-blue-600 hover:text-blue-700 font-medium">
                        Registrarse
                      </Link>
                    </p>
                    <p className="text-slate-600">
                      <Link href="/recuperar-contrasena" className="text-blue-600 hover:text-blue-700 font-medium">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}





