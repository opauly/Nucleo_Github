"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { FileText, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'

interface Announcement {
  id: string
  title: string
  content: string
  summary?: string
  status: 'draft' | 'published'
  is_featured: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export default function AdminAnnouncementsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAnnouncements()
    }
  }, [user])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements')
      const result = await response.json()

      if (response.ok) {
        setAnnouncements(result.announcements || [])
      } else {
        toast.error(result.error || 'Error al cargar anuncios')
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (announcementId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/announcements/${announcementId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Anuncio eliminado exitosamente')
        fetchAnnouncements()
      } else {
        const result = await response.json()
        toast.error(result.error || 'Error al eliminar anuncio')
      }
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Error de conexión')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Publicado</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Borrador</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="lg" 
            className="flex items-center gap-2 bg-blue-600 border-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 shadow-lg"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Panel Principal
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Anuncios</h1>
            <p className="text-slate-600">Administra los anuncios de la iglesia</p>
          </div>
          <Button onClick={() => router.push('/admin/content/announcements/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Anuncio
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay anuncios</h3>
              <p className="text-slate-600 text-center mb-6">
                Aún no se han creado anuncios. Crea el primer anuncio para comenzar.
              </p>
              <Button onClick={() => router.push('/admin/content/announcements/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Anuncio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-xl">{announcement.title}</CardTitle>
                        {announcement.is_featured && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Destacado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>Estado: {getStatusBadge(announcement.status)}</span>
                        <span>Creado: {formatDate(announcement.created_at)}</span>
                        {announcement.published_at && (
                          <span>Publicado: {formatDate(announcement.published_at)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/admin/content/announcements/${announcement.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {announcement.summary && (
                    <p className="text-slate-600 mb-4">{announcement.summary}</p>
                  )}
                  <div 
                    className="prose prose-sm max-w-none text-slate-600"
                    dangerouslySetInnerHTML={{ 
                      __html: announcement.content.length > 200 
                        ? announcement.content.substring(0, 200) + '...' 
                        : announcement.content
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
