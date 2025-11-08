"use client"

export function Map() {
  return (
    <section className="py-20 lg:py-32 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-8 tracking-tight">
              Encuéntranos
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed font-light">
              Visítanos en San José, Costa Rica. Te esperamos con los brazos abiertos para compartir juntos en comunidad.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="border-l-4 border-slate-200 pl-4">
                <h4 className="font-semibold text-slate-900 text-lg">Ubicación</h4>
                <p className="text-slate-600 mb-2">San José, Costa Rica</p>
                <p className="text-slate-600">Centro de la ciudad</p>
              </div>
              
              <div className="border-l-4 border-slate-200 pl-4">
                <h4 className="font-semibold text-slate-900 text-lg">Horarios de Servicio</h4>
                <p className="text-slate-600 mb-2">Domingos: 10:00 AM y 6:00 PM</p>
                <p className="text-slate-600">Miércoles: 7:00 PM - Estudio Bíblico</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://www.waze.com/live-map/directions?navigate=yes&utm_campaign=default&utm_source=waze_website&utm_medium=lm_share_location&to=ll.9.93202305%2C-84.06492591"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl text-lg"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Waze
              </a>
              
              <a
                href="https://maps.google.com/?q=9.93202305,-84.06492591"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg hover:shadow-xl text-lg"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Google Maps
              </a>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="relative">
            <div className="aspect-[4/3] lg:aspect-[3/2] rounded-2xl overflow-hidden shadow-lg">
              {/* Waze Live Map Embed */}
              <iframe
                src="https://embed.waze.com/iframe?zoom=16&lat=9.932023&lon=-84.064926&ct=livemap"
                title="Ubicación de Núcleo en Waze"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              />
              
              {/* Waze-style overlay with location info */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Núcleo</div>
                    <div className="text-xs text-slate-600">San José, Costa Rica</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
