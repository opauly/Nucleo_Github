"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TeamJoinButtonProps {
  teamId: string
  teamName: string
}

export function TeamJoinButton({ teamId, teamName }: TeamJoinButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isJoining, setIsJoining] = useState(false)
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkMembershipStatus = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams/membership-status?teamId=${teamId}&userId=${user.id}`)
      const result = await response.json()

      if (response.ok) {
        setMembershipStatus(result.membership?.status || null)
      }
    } catch (error) {
      console.error('Error checking membership status:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, teamId])

  // Check membership status when component mounts or user changes
  useEffect(() => {
    if (user && teamId) {
      checkMembershipStatus()
    }
  }, [user, teamId, checkMembershipStatus])

  const handleJoinTeam = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para unirte a equipos')
      router.push('/iniciar-sesion')
      return
    }

    setIsJoining(true)

    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId,
          userId: user.id,
          message: null
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`¡Solicitud enviada para unirte a "${teamName}"!`)
        // Update local state
        setMembershipStatus('pending')
      } else {
        toast.error(result.error || 'Error al enviar solicitud')
      }
    } catch (error) {
      console.error('Join team error:', error)
      toast.error('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        className="w-full border-slate-300 text-slate-700"
        disabled
      >
        Cargando...
      </Button>
    )
  }

  // Show different states based on membership status
  if (membershipStatus) {
    let statusText = ''
    let statusColor = ''
    const isDisabled = true

    switch (membershipStatus) {
      case 'pending':
        statusText = 'Solicitud Pendiente'
        statusColor = 'bg-yellow-600 text-white'
        break
      case 'approved':
        statusText = 'Miembro'
        statusColor = 'bg-green-600 text-white'
        break
      case 'rejected':
        statusText = 'Solicitud Rechazada'
        statusColor = 'bg-red-600 text-white'
        break
      default:
        statusText = 'Estado Desconocido'
        statusColor = 'bg-slate-600 text-white'
    }

    return (
      <Button 
        variant="outline" 
        className={`w-full border-slate-300 cursor-not-allowed ${statusColor}`}
        disabled={isDisabled}
      >
        {statusText}
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleJoinTeam}
      disabled={isJoining}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isJoining ? 'Enviando...' : 'Unirse al Equipo'}
    </Button>
  )
}
