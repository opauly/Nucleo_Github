import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DevocionalesPage() {
  const supabase = await createClient()
  
  let devotionals: any[] = []
  
  if (supabase) {
    const { data, error } = await supabase
      .from('devotionals')
      .select('*')
      .not('published_at', 'is', null) // Only show published devotionals
      .order('published_at', { ascending: false })
    
    if (!error && data) {
      devotionals = data
    }
  }

  return (
    <div className="min-h-screen bg-white pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          <img
            src="/img/devocional-hero.jpg"
            alt="Reflexiones espirituales"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Devocionales
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Reflexiones diarias para nutrir tu fe y fortalecer tu relación con Dios
            </p>
          </div>
        </div>
      </section>

      {/* Devotionals Grid */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4 tracking-tight">
              Reflexiones Espirituales
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
              Encuentra inspiración y guía en estas reflexiones basadas en la Palabra de Dios
            </p>
          </div>

          {devotionals.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {devotionals.map((devotional, index) => (
                <Card key={devotional.id || index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  {/* Featured Image */}
                  <div className="h-48 relative bg-slate-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/50 to-slate-900/60">
                      {devotional.image_url ? (
                        <img
                          src={devotional.image_url}
                          alt={devotional.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={`/img/devocional-${(index % 3) + 1}.jpg?v=1`}
                          alt={devotional.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm text-slate-200 drop-shadow-md">
                        {devotional.author || 'Pastor Miguel'}
                      </p>
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                        {devotional.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-sm line-clamp-3">
                        {devotional.summary || 'Reflexión espiritual para fortalecer tu fe y caminar con Dios.'}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        {devotional.published_at ? new Date(devotional.published_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Reciente'}
                      </span>
                      <Link href={`/devocionales/${devotional.id}`}>
                        <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white">
                          Leer Más
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // No devotionals message
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl p-12 shadow-lg">
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  No hay devocionales disponibles
                </h3>
                <p className="text-slate-600">
                  Pronto tendremos nuevas reflexiones espirituales para compartir contigo.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-black text-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 tracking-tight">
              Nutre Tu Fe Diariamente
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              Únete a nuestra comunidad y recibe reflexiones diarias para fortalecer tu caminar con Dios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl">
                Registrarse
              </Button>
              <Button className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl">
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
