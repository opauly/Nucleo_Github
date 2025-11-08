import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { notFound } from 'next/navigation'

interface DevotionalDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DevotionalDetailPage({ params }: DevotionalDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  if (!supabase) {
    notFound()
  }

  // Fetch the specific devotional
  const { data: devotional, error } = await supabase
    .from('devotionals')
    .select('*')
    .eq('id', id)
    .not('published_at', 'is', null) // Only show if published
    .single()

  if (error || !devotional) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section with Featured Image */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          {devotional.image_url ? (
            <img
              src={devotional.image_url}
              alt={devotional.title}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
          )}
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link href="/devocionales">
              <Button 
                variant="outline" 
                className="mb-8 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Devocionales
              </Button>
            </Link>

            {/* Title and Meta */}
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight drop-shadow-lg">
                {devotional.title}
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-slate-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{devotional.author || 'Pastor Miguel'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(devotional.published_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(devotional.published_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              {/* Summary */}
              {devotional.summary && (
                <p className="text-xl text-slate-200 leading-relaxed mt-6 max-w-3xl mx-auto drop-shadow-md">
                  {devotional.summary}
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
                  dangerouslySetInnerHTML={{ __html: devotional.content }}
                />

                {/* Divider */}
                <div className="border-t border-slate-200 mt-12 pt-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-500">
                      <p>Publicado el {new Date(devotional.published_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                      <p>Por {devotional.author || 'Pastor Miguel'}</p>
                    </div>
                    
                    <Link href="/devocionales">
                      <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Devocionales
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
              Continúa Nutriendo Tu Fe
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              Descubre más reflexiones espirituales para fortalecer tu caminar con Dios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/devocionales">
                <Button className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl">
                  Ver Más Devocionales
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
export async function generateMetadata({ params }: DevotionalDetailPageProps) {
  const supabase = await createClient()
  
  if (!supabase) {
    return {
      title: 'Devocional | Núcleo',
    }
  }

  const { data: devotional } = await supabase
    .from('devotionals')
    .select('title, summary')
    .eq('id', params.id)
    .single()

  if (!devotional) {
    return {
      title: 'Devocional | Núcleo',
    }
  }

  return {
    title: `${devotional.title} | Núcleo`,
    description: devotional.summary || 'Reflexión espiritual para fortalecer tu fe',
  }
}
