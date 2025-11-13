export default function TerminosYCondicionesPage() {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 lg:p-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Términos y Condiciones de Uso
            </h1>
            <p className="text-slate-600 mb-8">
              Última actualización: {new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <div className="prose prose-slate max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Aceptación de los Términos</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Al acceder y utilizar el sitio web de Núcleo, usted acepta cumplir con estos Términos y Condiciones de Uso. 
                  Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio web.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor 
                  inmediatamente después de su publicación en el sitio web. Es su responsabilidad revisar periódicamente estos términos.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Uso del Sitio Web</h2>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.1. Uso Permitido</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Usted puede utilizar nuestro sitio web para:
                </p>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2 ml-4">
                  <li>Acceder a información sobre nuestros servicios, eventos y actividades</li>
                  <li>Registrarse para participar en eventos y equipos</li>
                  <li>Leer devocionales y anuncios</li>
                  <li>Contactarnos a través de nuestros formularios</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mb-3">2.2. Uso Prohibido</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Está prohibido utilizar nuestro sitio web para:
                </p>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2 ml-4">
                  <li>Cualquier propósito ilegal o no autorizado</li>
                  <li>Transmitir virus, malware o código malicioso</li>
                  <li>Intentar acceder no autorizado a sistemas o datos</li>
                  <li>Copiar, modificar o distribuir contenido sin autorización</li>
                  <li>Realizar actividades que puedan dañar o interferir con el funcionamiento del sitio</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Cuentas de Usuario</h2>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">3.1. Registro</h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Para acceder a ciertas funcionalidades del sitio, debe crear una cuenta. Al registrarse, usted se compromete a:
                </p>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2 ml-4">
                  <li>Proporcionar información precisa, actual y completa</li>
                  <li>Mantener y actualizar su información de cuenta</li>
                  <li>Mantener la confidencialidad de su contraseña</li>
                  <li>Notificarnos inmediatamente de cualquier uso no autorizado de su cuenta</li>
                  <li>Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-800 mb-3">3.2. Seguridad</h3>
                <p className="text-slate-700 leading-relaxed">
                  Usted es responsable de mantener la confidencialidad de sus credenciales de acceso. Núcleo no será responsable 
                  de ninguna pérdida o daño resultante del incumplimiento de esta obligación.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Privacidad y Protección de Datos</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  El tratamiento de sus datos personales se rige por nuestra Política de Privacidad, que forma parte integral de estos 
                  Términos y Condiciones. Al utilizar nuestro sitio web, usted consiente el procesamiento de sus datos personales de 
                  acuerdo con nuestra Política de Privacidad.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Recopilamos y procesamos información personal únicamente para los fines legítimos de proporcionar nuestros servicios, 
                  gestionar eventos, comunicarnos con usted y mejorar nuestra plataforma. Sus datos están protegidos mediante medidas 
                  de seguridad técnicas y organizativas apropiadas.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Propiedad Intelectual</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Todo el contenido del sitio web, incluyendo pero no limitado a textos, gráficos, logotipos, iconos, imágenes, 
                  clips de audio, descargas digitales y compilaciones de datos, es propiedad de Núcleo o de sus proveedores de contenido 
                  y está protegido por las leyes de derechos de autor y otras leyes de propiedad intelectual.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Usted no puede reproducir, distribuir, modificar, crear trabajos derivados, mostrar públicamente, ejecutar públicamente, 
                  republicar, descargar, almacenar o transmitir ningún material de nuestro sitio web sin nuestro consentimiento previo por escrito.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Contenido del Usuario</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Al publicar, cargar o transmitir contenido a través de nuestro sitio web, usted nos otorga una licencia no exclusiva, 
                  mundial, libre de regalías y transferible para usar, reproducir, modificar, adaptar, publicar y distribuir dicho contenido.
                </p>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Usted garantiza que:
                </p>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2 ml-4">
                  <li>Posee todos los derechos necesarios sobre el contenido que publica</li>
                  <li>El contenido no infringe los derechos de terceros</li>
                  <li>El contenido no es difamatorio, ofensivo, ilegal o inapropiado</li>
                  <li>El contenido cumple con todas las leyes y regulaciones aplicables</li>
                </ul>
                <p className="text-slate-700 leading-relaxed">
                  Nos reservamos el derecho de eliminar cualquier contenido que consideremos inapropiado, ilegal o que viole estos términos.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Limitación de Responsabilidad</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  En la medida máxima permitida por la ley, Núcleo no será responsable de ningún daño directo, indirecto, incidental, 
                  especial, consecuente o punitivo que resulte del uso o la imposibilidad de usar nuestro sitio web.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Proporcionamos el sitio web "tal cual" y "según disponibilidad", sin garantías de ningún tipo, expresas o implícitas, 
                  incluyendo pero no limitado a garantías de comerciabilidad, idoneidad para un propósito particular y no infracción.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Enlaces a Terceros</h2>
                <p className="text-slate-700 leading-relaxed">
                  Nuestro sitio web puede contener enlaces a sitios web de terceros. Estos enlaces se proporcionan únicamente para su 
                  conveniencia. No tenemos control sobre el contenido de estos sitios y no asumimos responsabilidad por ellos. La inclusión 
                  de cualquier enlace no implica nuestro respaldo del sitio web enlazado.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Modificaciones del Servicio</h2>
                <p className="text-slate-700 leading-relaxed">
                  Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del sitio web en cualquier momento, 
                  con o sin previo aviso. No seremos responsables ante usted ni ante ningún tercero por cualquier modificación, suspensión 
                  o discontinuación del servicio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Terminación</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Podemos terminar o suspender su acceso a nuestro sitio web inmediatamente, sin previo aviso, por cualquier motivo, 
                  incluyendo pero no limitado a:
                </p>
                <ul className="list-disc list-inside text-slate-700 mb-4 space-y-2 ml-4">
                  <li>Violación de estos Términos y Condiciones</li>
                  <li>Uso fraudulento o no autorizado del sitio</li>
                  <li>Actividades que puedan dañar a otros usuarios o al sitio</li>
                </ul>
                <p className="text-slate-700 leading-relaxed">
                  Tras la terminación, su derecho a utilizar el sitio web cesará inmediatamente.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Ley Aplicable y Jurisdicción</h2>
                <p className="text-slate-700 leading-relaxed">
                  Estos Términos y Condiciones se rigen e interpretan de acuerdo con las leyes de la República de Costa Rica. 
                  Cualquier disputa relacionada con estos términos será sometida a la jurisdicción exclusiva de los tribunales de Costa Rica.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Contacto</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través de:
                </p>
                <ul className="list-none text-slate-700 space-y-2">
                  <li>Formulario de contacto en nuestro sitio web</li>
                  <li>Email: contacto@nucleo.cr (ejemplo - actualizar con email real)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Disposiciones Generales</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Si alguna disposición de estos términos se considera inválida o inaplicable, las disposiciones restantes permanecerán 
                  en pleno vigor y efecto. Estos términos constituyen el acuerdo completo entre usted y Núcleo respecto al uso del sitio web.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Núcleo se reserva el derecho de transferir, ceder o subcontratar cualquiera o todos nuestros derechos y obligaciones 
                  bajo estos términos sin notificación previa.
                </p>
              </section>

              <div className="border-t border-slate-200 pt-8 mt-8">
                <p className="text-sm text-slate-600">
                  Al utilizar este sitio web, usted reconoce que ha leído, entendido y acepta estar sujeto a estos Términos y Condiciones de Uso.
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  © {currentYear} Núcleo. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

