import { createAdminClient } from './admin-client'

export async function seedDatabase() {
  const supabase = createAdminClient()
  
  if (!supabase) {
    console.error('❌ Supabase admin client not initialized. Please set SUPABASE_SERVICE_ROLE_KEY in your .env.local file.')
    return false
  }

  console.log('🌱 Starting database seeding...')

  try {
    // 1. Seed Teams
    console.log('📋 Seeding teams...')
    const { error: teamsError } = await supabase
      .from('teams')
      .insert([
        {
          name: 'Músicos',
          description: 'Equipo de adoración y música que lidera los tiempos de alabanza en nuestros servicios. Creemos que la música es una herramienta poderosa para conectar con Dios.'
        },
        {
          name: 'Núcleo Kids',
          description: 'Ministerio dedicado a los más pequeños, donde aprenden sobre el amor de Dios de manera divertida y creativa.'
        },
        {
          name: 'Acción Social',
          description: 'Equipo comprometido con servir a la comunidad, brindando ayuda y esperanza a quienes más lo necesitan.'
        },
        {
          name: 'Núcleo Teens',
          description: 'Espacio especial para adolescentes donde pueden crecer en su fe mientras construyen amistades significativas.'
        },
        {
          name: 'Unánimes',
          description: 'Grupo dedicado a la oración intercesora, donde oramos juntos por las necesidades de nuestra iglesia y comunidad.'
        },
        {
          name: 'Matrimonios',
          description: 'Ministerio que fortalece los matrimonios y familias, construyendo relaciones sólidas basadas en principios bíblicos.'
        },
        {
          name: 'Logística',
          description: 'Equipo que asegura que todos los eventos y servicios funcionen perfectamente, desde la preparación hasta la ejecución.'
        },
        {
          name: 'Evangelismo',
          description: 'Ministerio enfocado en compartir el amor de Cristo con otros, llevando la esperanza del evangelio a nuestra comunidad.'
        }
      ])

    if (teamsError) {
      console.error('❌ Error seeding teams:', teamsError.message)
    } else {
      console.log('✅ Teams seeded successfully')
    }

    // 2. Seed Events
    console.log('📅 Seeding events...')
    const { error: eventsError } = await supabase
      .from('events')
      .insert([
        {
          title: 'Estudio Bíblico Semanal',
          description: 'Profundizamos en el estudio de las Escrituras. Un tiempo especial para crecer en el conocimiento de la Palabra de Dios.',
          start_date: new Date('2025-01-29T19:00:00-06:00').toISOString(),
          end_date: new Date('2025-01-29T21:00:00-06:00').toISOString(),
          location: 'Aula 1',
          max_participants: 50,
          status: 'published'
        },
        {
          title: 'Reunión de Jóvenes',
          description: 'Tiempo especial para los jóvenes de la iglesia. Conectamos, aprendemos y crecemos juntos en la fe.',
          start_date: new Date('2025-01-31T18:00:00-06:00').toISOString(),
          end_date: new Date('2025-01-31T20:00:00-06:00').toISOString(),
          location: 'Salón de Jóvenes',
          max_participants: 30,
          status: 'published'
        },
        {
          title: 'Servicio Dominical',
          description: 'Nuestro servicio dominical principal. Ven a adorar, aprender y conectarte con la comunidad.',
          start_date: new Date('2025-02-02T10:00:00-06:00').toISOString(),
          end_date: new Date('2025-02-02T12:00:00-06:00').toISOString(),
          location: 'Auditorio Principal',
          max_participants: 200,
          status: 'published'
        }
      ])

    if (eventsError) {
      console.error('❌ Error seeding events:', eventsError.message)
    } else {
      console.log('✅ Events seeded successfully')
    }

    // 3. Seed Announcements
    console.log('📢 Seeding announcements...')
    const { error: announcementsError } = await supabase
      .from('announcements')
      .insert([
        {
          title: 'Retiro de Jóvenes',
          content: 'Inscripciones abiertas para el retiro de jóvenes del próximo mes. Un fin de semana especial para crecer en la fe y construir amistades.',
          published_at: new Date().toISOString(),
          is_featured: true
        },
        {
          title: 'Nuevo Horario de Servicios',
          content: 'A partir del próximo mes, nuestros servicios serán a las 10:00 AM y 6:00 PM. ¡Esperamos verte allí!',
          published_at: new Date().toISOString(),
          is_featured: false
        },
        {
          title: 'Noche de Oración',
          content: 'Únete a nosotros para una noche especial de oración y adoración. Un tiempo para buscar la presencia de Dios juntos.',
          published_at: new Date().toISOString(),
          is_featured: false
        }
      ])

    if (announcementsError) {
      console.error('❌ Error seeding announcements:', announcementsError.message)
    } else {
      console.log('✅ Announcements seeded successfully')
    }

    console.log('🎉 Database seeding completed!')
    return true

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    return false
  }
}
