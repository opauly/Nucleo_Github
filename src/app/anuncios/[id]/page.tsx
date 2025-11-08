import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'

interface AnnouncementDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AnnouncementDetailPage({ params }: AnnouncementDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  if (!supabase) {
    notFound()
  }

  // Fetch the specific announcement
  const { data: announcement, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .not('published_at', 'is', null) // Only show if published
    .single()

  if (error || !announcement) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section with Featured Image */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          {announcement.image_url ? (
            <img
              src={announcement.image_url}
              alt={announcement.title}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-900" />
          )}
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link href="/anuncios">
              <Button 
                variant="outline" 
                className="mb-8 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Anuncios
              </Button>
            </Link>

            {/* Title and Meta */}
            <div className="text-center text-white">
              {announcement.is_featured && (
                <div className="mb-4">
                  <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
                    Anuncio Destacado
                  </Badge>
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight drop-shadow-lg">
                {announcement.title}
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(announcement.published_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(announcement.published_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              {/* Summary */}
              {announcement.summary && (
                <p className="text-xl text-slate-200 leading-relaxed mt-6 max-w-3xl mx-auto drop-shadow-md">
                  {announcement.summary}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl bg-white">
              <CardContent className="p-8 lg:p-12">
                {/* Content */}
                <div 
                  className="prose prose-lg prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />

                {/* Divider */}
                <div className="border-t border-slate-200 mt-12 pt-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-500">
                      <p>Publicado el {new Date(announcement.published_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                      {announcement.is_featured && (
                        <p>Anuncio destacado</p>
                      )}
                    </div>
                    
                    <Link href="/anuncios">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Anuncios
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-black text-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 tracking-tight">
              Mantente Informado
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              No te pierdas las últimas noticias y anuncios importantes de nuestra comunidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/anuncios">
                <Button className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl">
                  Ver Más Anuncios
                </Button>
              </Link>
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3 text-lg font-medium"
                >
                  Inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: AnnouncementDetailPageProps) {
  const supabase = await createClient()
  
  if (!supabase) {
    return {
      title: 'Anuncio | Núcleo',
    }
  }

  const { data: announcement } = await supabase
    .from('announcements')
    .select('title, summary')
    .eq('id', params.id)
    .single()

  if (!announcement) {
    return {
      title: 'Anuncio | Núcleo',
    }
  }

  return {
    title: `${announcement.title} | Núcleo`,
    description: announcement.summary || 'Mantente informado sobre las últimas noticias de nuestra iglesia',
  }
}
