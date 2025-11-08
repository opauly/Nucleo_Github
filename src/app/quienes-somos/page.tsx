import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Heart, BookOpen, Target } from 'lucide-react'

export const metadata = {
  title: 'Quiénes Somos - Núcleo',
  description: 'Conoce más sobre Núcleo, nuestra misión, visión y valores como iglesia.',
}

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          <img
            src="/img/quienes-somos-hero.jpg"
            alt="Nuestra comunidad de fe"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Quiénes Somos
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Una comunidad de fe comprometida con el amor de Cristo y el servicio a los demás.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-6 tracking-tight">
                  Nuestra Misión
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                  Llevar el amor de Cristo a cada persona, transformando vidas a través del evangelio y construyendo una comunidad que refleje el carácter de Jesús.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  Creemos que cada persona tiene un propósito único en el plan de Dios, y nuestro deseo es ayudarte a descubrir y desarrollar ese propósito en tu vida.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Únete a nosotros
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src="/img/mision.jpg?v=1" 
                    alt="Nuestra misión" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-6 tracking-tight">
                Nuestros Valores
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Estos principios guían todo lo que hacemos como iglesia y como individuos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Amor</h3>
                <p className="text-slate-600">
                  El amor de Cristo es el fundamento de todo lo que hacemos y la base de nuestras relaciones.
                </p>
              </Card>

              <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Palabra</h3>
                <p className="text-slate-600">
                  La Biblia es nuestra guía autoritativa para la fe y la práctica cristiana.
                </p>
              </Card>

              <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Comunidad</h3>
                <p className="text-slate-600">
                  Creemos en el poder de la comunidad para crecer juntos en la fe.
                </p>
              </Card>

              <Card className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Propósito</h3>
                <p className="text-slate-600">
                  Cada persona tiene un propósito único en el plan de Dios para este mundo.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-6 tracking-tight">
                Nuestra Historia
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Una historia de fe, crecimiento y transformación de vidas.
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">Los Inicios</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Núcleo comenzó como un pequeño grupo de creyentes comprometidos con compartir el evangelio en San José, Costa Rica. Lo que empezó como reuniones en hogares ha crecido hasta convertirse en una comunidad vibrante de fe.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">Crecimiento y Desarrollo</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  A lo largo de los años, hemos visto cómo Dios ha bendecido nuestro ministerio, multiplicando no solo nuestro número, sino también nuestro impacto en la comunidad. Hemos desarrollado ministerios especializados para diferentes grupos de edad y necesidades.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">Hoy y el Futuro</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Hoy, Núcleo continúa creciendo y evolucionando, siempre fiel a nuestra misión de llevar el amor de Cristo a cada persona. Miramos hacia el futuro con expectativa, sabiendo que Dios tiene grandes planes para nuestra iglesia y nuestra comunidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-slate-900 text-white py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 tracking-tight">
              ¿Te gustaría ser parte de nuestra historia?
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              Únete a nosotros en este viaje de fe y descubre cómo puedes ser parte de lo que Dios está haciendo en Núcleo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                Visítanos este domingo
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3 text-lg">
                Contáctanos
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
