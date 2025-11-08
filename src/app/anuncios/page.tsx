import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Anuncios - Núcleo',
  description: 'Mantente informado sobre las últimas noticias y anuncios de nuestra iglesia.',
}

export default async function AnunciosPage() {
  const supabase = await createClient()
  
  let announcements = []
  let error = null

  if (supabase) {
    const { data, error: fetchError } = await supabase
      .from('announcements')
      .select('*')
      .not('published_at', 'is', null) // Only show published announcements
      .order('published_at', { ascending: false })

    if (fetchError) {
      error = fetchError.message
    } else {
      announcements = data || []
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          <img
            src="/img/anuncios-hero.jpg"
            alt="Anuncios y noticias de la iglesia"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Anuncios
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Mantente informado sobre las últimas noticias, eventos y anuncios importantes de nuestra comunidad.
            </p>
          </div>
        </div>
      </section>

      {/* Announcements List */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          {error ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">Error al cargar los anuncios: {error}</p>
              </div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  No hay anuncios disponibles
                </h3>
                <p className="text-slate-600">
                  Pronto tendremos nuevos anuncios para compartir contigo.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  {/* Featured Image */}
                  {announcement.image_url && (
                    <div className="h-48 relative bg-slate-800">
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      {announcement.is_featured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-blue-600 text-white">
                            Destacado
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Content */}
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                        {announcement.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-sm line-clamp-3">
                        {announcement.summary || 'Mantente informado sobre las últimas noticias de nuestra comunidad.'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(announcement.published_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(announcement.published_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Link href={`/anuncios/${announcement.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          Leer Más
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
