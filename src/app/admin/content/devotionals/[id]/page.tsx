"use client"

import { DevotionalForm } from '@/components/admin/devotional-form'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Devotional {
  id: string
  title: string
  content: string
  status: string
  scripture_reference?: string
  created_at: string
  updated_at: string
}

export default function EditDevotionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth()
  const router = useRouter()
  const [devotional, setDevotional] = useState<Devotional | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/iniciar-sesion')
      return
    }

    const loadData = async () => {
      const { id } = await params
      await fetchDevotional(id)
    }
    
    loadData()
  }, [user, router, params])

  const fetchDevotional = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/devotionals/${id}`)
      
      if (response.ok) {
        const result = await response.json()
        setDevotional(result.devotional)
      } else {
        toast.error('Error al cargar el devocional')
        router.push('/admin/content/devotionals')
      }
    } catch (error) {
      console.error('Error fetching devotional:', error)
              toast.error('Error de conexión')
        router.push('/admin/content/devotionals')
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
            <p className="text-slate-600">Cargando devocional...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!devotional) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-slate-600">Devocional no encontrado</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-8">
        <DevotionalForm 
          devotional={devotional}
          onSave={() => router.push('/admin/content/devotionals')}
          onCancel={() => router.push('/admin/content/devotionals')}
        />
      </div>
    </div>
  )
}
