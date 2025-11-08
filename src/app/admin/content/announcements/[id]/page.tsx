"use client"

import { AnnouncementForm } from '@/components/admin/announcement-form'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string
  status: string
  created_at: string
  updated_at: string
}

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const router = useRouter()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/iniciar-sesion')
      return
    }

    const loadData = async () => {
      const { id } = await params
      await fetchAnnouncement(id)
    }
    
    loadData()
  }, [user, router, params])

  const fetchAnnouncement = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/announcements/${id}`)
      
      if (response.ok) {
        const result = await response.json()
        setAnnouncement(result.announcement)
      } else {
        toast.error('Error al cargar el anuncio')
        router.push('/admin/content/announcements')
      }
    } catch (error) {
      console.error('Error fetching announcement:', error)
              toast.error('Error de conexión')
        router.push('/admin/content/announcements')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-slate-600">Cargando anuncio...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-slate-600">Anuncio no encontrado</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-8">
        <AnnouncementForm 
          announcement={announcement}
          onSave={() => router.push('/admin/content/announcements')}
          onCancel={() => router.push('/admin/content/announcements')}
        />
      </div>
    </div>
  )
}
