"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface EventShareButtonProps {
  eventId: string
  eventTitle: string
}

export function EventShareButton({ eventId, eventTitle }: EventShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [eventUrl, setEventUrl] = useState<string>('')

  // Set URL after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEventUrl(`${window.location.origin}/eventos/${eventId}`)
    } else {
      setEventUrl(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://nucleo.com'}/eventos/${eventId}`)
    }
  }, [eventId])

  const handleCopyLink = async () => {
    if (!eventUrl) return
    
    try {
      await navigator.clipboard.writeText(eventUrl)
      setCopied(true)
      toast.success('Enlace copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
      toast.error('Error al copiar el enlace')
    }
  }

  const shareText = `¡Mira este evento: ${eventTitle}`

  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full justify-start" 
        onClick={handleCopyLink}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Enlace copiado
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copiar enlace
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start" 
        disabled={!eventUrl}
        onClick={() => {
          if (eventUrl) {
            window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} - ${eventUrl}`)}`, '_blank', 'noopener,noreferrer')
          }
        }}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Compartir por WhatsApp
      </Button>
      <Button 
        variant="outline" 
        className="w-full justify-start" 
        disabled={!eventUrl}
        onClick={() => {
          if (eventUrl) {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank', 'noopener,noreferrer')
          }
        }}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Compartir en Facebook
      </Button>
    </div>
  )
}
