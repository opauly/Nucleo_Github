import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ArrowRight, Info } from 'lucide-react'
import { TeamJoinButton } from '@/components/ui/team-join-button'
import Link from 'next/link'

export const metadata = {
  title: 'Nuestros Equipos - Núcleo',
  description: 'Conoce los diferentes ministerios y equipos que conforman nuestra comunidad.',
}

export default async function EquiposPage() {
  const supabase = await createClient()
  
  let teams = []
  let error = null

  if (supabase) {
    const { data, error: fetchError } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true })

    if (fetchError) {
      error = fetchError.message
    } else {
      teams = data || []
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          <img
            src="/img/equipos-hero.jpg"
            alt="Equipos y ministerios de la iglesia"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Nuestros Equipos
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Conoce los diferentes ministerios que conforman nuestra comunidad y descubre dónde puedes servir.
            </p>
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          {error ? (
            <div className="max-w-6xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">Error al cargar los equipos: {error}</p>
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="max-w-6xl mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  No hay equipos disponibles
                </h3>
                <p className="text-slate-600">
                  Pronto tendremos información sobre nuestros equipos.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teams.map((team) => (
                  <Card key={team.id} className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-xl text-slate-900">
                          {team.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 leading-relaxed mb-6">
                        {team.description}
                      </p>
                      <div className="flex flex-col gap-3">
                        <Link href={`/equipos/${team.id}`}>
                          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                            <Info className="w-4 h-4" />
                            Conocer Más
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                        <TeamJoinButton
                          teamId={team.id}
                          teamName={team.name}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
