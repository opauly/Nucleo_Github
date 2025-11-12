"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface EventRegistrationButtonProps {
  eventId: string
  eventTitle: string
  isUpcoming: boolean
}

export function EventRegistrationButton({ 
  eventId, 
  eventTitle, 
  isUpcoming 
}: EventRegistrationButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkRegistrationStatus = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/registration-status?eventId=${eventId}&userId=${user.id}`)
      const result = await response.json()

      if (response.ok) {
        setIsRegistered(result.isRegistered)
        setRegistrationStatus(result.registration?.status || null)
      }
    } catch (error) {
      console.error('Error checking registration status:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, eventId])

  // Check registration status when component mounts or user changes
  useEffect(() => {
    if (user && eventId) {
      checkRegistrationStatus()
    }
  }, [user, eventId, checkRegistrationStatus])

  const handleRegistration = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para registrarte en eventos')
      router.push('/iniciar-sesion')
      return
    }

    setIsRegistering(true)

    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          userId: user.id,
          notes: null
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`¡Te has registrado exitosamente para "${eventTitle}"!`)
        // Update local state instead of reloading
        setIsRegistered(true)
        setRegistrationStatus('pending')
      } else {
        toast.error(result.error || 'Error al registrarse para el evento')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsRegistering(false)
    }
  }

  if (!isUpcoming) {
    return (
      <Button 
        variant="outline" 
        className="border-slate-300 text-slate-700 cursor-not-allowed"
        disabled
      >
        Evento Finalizado
      </Button>
    )
  }

  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        className="border-slate-300 text-slate-700"
        disabled
      >
        Cargando...
      </Button>
    )
  }

  if (isRegistered) {
    let statusText = 'Registrado'
    let statusColor = 'bg-blue-600'
    
    if (registrationStatus === 'pending') {
      statusText = 'Pendiente'
      statusColor = 'bg-yellow-600'
    } else if (registrationStatus === 'rejected') {
      statusText = 'Rechazado'
      statusColor = 'bg-red-600'
    } else if (registrationStatus === 'approved') {
      statusText = 'Registrado'
      statusColor = 'bg-blue-600'
    }

    return (
      <Button 
        variant="outline" 
        className={`border-slate-300 text-slate-700 cursor-not-allowed ${statusColor} text-white`}
        disabled
      >
        {statusText}
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleRegistration}
      disabled={isRegistering}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isRegistering ? 'Registrando...' : 'Registrarse'}
    </Button>
  )
}
