"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { useReCaptcha } from '@/components/ui/recaptcha'

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const supabase = createClient()
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const { getToken } = useReCaptcha(recaptchaSiteKey)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setStatus('error')
      setMessage('Por favor ingresa tu email')
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
        const recaptchaToken = await getToken('password_reset')
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

      // Get the site URL for the redirect
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const redirectTo = `${siteUrl}/recuperar-contrasena/confirmar`

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        throw error
      }

      // Always show success message (for security, don't reveal if email exists)
      setStatus('success')
      setMessage('Si el email está registrado, recibirás un enlace para restablecer tu contraseña.')
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Error al enviar el email de recuperación')
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
            alt="Recuperar contraseña"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Recuperar Contraseña
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
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
                  <Mail className="w-6 h-6" />
                  Restablecer Contraseña
                </CardTitle>
              </CardHeader>
              <CardContent>
                {status === 'success' ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Email enviado</p>
                        <p className="text-sm">{message}</p>
                      </div>
                    </div>
                    <div className="text-center space-y-4">
                      <p className="text-slate-600 text-sm">
                        Revisa tu bandeja de entrada y sigue las instrucciones en el email.
                      </p>
                      <p className="text-slate-600 text-sm">
                        Si no recibes el email en unos minutos, revisa tu carpeta de spam.
                      </p>
                      <div className="pt-4">
                        <Link href="/iniciar-sesion">
                          <Button
                            variant="outline"
                            className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            Volver a Iniciar Sesión
                          </Button>
                        </Link>
                      </div>
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

                    {/* Info Message */}
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                      <p>
                        Ingresa el email asociado a tu cuenta. Te enviaremos un enlace para restablecer tu contraseña.
                      </p>
                    </div>

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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                        placeholder="tu@email.com"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                    </Button>

                    {/* Links */}
                    <div className="text-center space-y-2">
                      <p className="text-slate-600">
                        ¿Recordaste tu contraseña?{' '}
                        <Link href="/iniciar-sesion" className="text-blue-600 hover:text-blue-700 font-medium">
                          Iniciar Sesión
                        </Link>
                      </p>
                      <p className="text-slate-600">
                        ¿No tienes una cuenta?{' '}
                        <Link href="/registro" className="text-blue-600 hover:text-blue-700 font-medium">
                          Registrarse
                        </Link>
                      </p>
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

