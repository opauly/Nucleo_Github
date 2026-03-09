import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase: any = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🌱 Starting server-side database seeding...')

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
      return NextResponse.json(
        { error: `Teams seeding failed: ${teamsError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Teams seeded successfully')

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
      return NextResponse.json(
        { error: `Events seeding failed: ${eventsError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Events seeded successfully')

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
      return NextResponse.json(
        { error: `Announcements seeding failed: ${announcementsError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Announcements seeded successfully')

    // 4. Seed Devotionals
    console.log('📖 Seeding devotionals...')
    const { error: devotionalsError } = await supabase
      .from('devotionals')
      .insert([
        {
          title: 'La Fe que Mueve Montañas',
          content: 'Jesús les dijo: "Porque de cierto os digo que si tenéis fe como un grano de mostaza, diréis a este monte: Pásate de aquí allá, y se pasará; y nada os será imposible." (Mateo 17:20). La fe, aunque sea pequeña como un grano de mostaza, tiene el poder de mover montañas en nuestras vidas.',
          author: 'Pastor Juan',
          published_at: new Date().toISOString(),
          is_featured: true
        },
        {
          title: 'El Amor de Dios',
          content: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna. (Juan 3:16). El amor de Dios es incondicional y transformador.',
          author: 'Pastora María',
          published_at: new Date().toISOString(),
          is_featured: false
        },
        {
          title: 'La Oración Persistente',
          content: 'Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá. (Mateo 7:7). La oración persistente es clave en nuestra relación con Dios.',
          author: 'Pastor Carlos',
          published_at: new Date().toISOString(),
          is_featured: false
        }
      ])

    if (devotionalsError) {
      console.error('❌ Error seeding devotionals:', devotionalsError.message)
      return NextResponse.json(
        { error: `Devotionals seeding failed: ${devotionalsError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Devotionals seeded successfully')

    // 5. Seed Contact Messages (sample data)
    console.log('📧 Seeding contact messages...')
    const { error: contactError } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: 'Ana García',
          email: 'ana.garcia@email.com',
          subject: 'Información sobre servicios',
          message: 'Hola, me gustaría saber más sobre los horarios de los servicios dominicales. ¿Podrían proporcionarme más información?',
          status: 'new'
        },
        {
          name: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@email.com',
          subject: 'Ministerio de jóvenes',
          message: 'Tengo un hijo adolescente y me interesa saber más sobre el ministerio de jóvenes. ¿Cuáles son las actividades que realizan?',
          status: 'read'
        },
        {
          name: 'María López',
          email: 'maria.lopez@email.com',
          subject: 'Voluntariado',
          message: 'Me gustaría participar como voluntaria en algún ministerio. ¿Podrían orientarme sobre las oportunidades disponibles?',
          status: 'replied'
        }
      ])

    if (contactError) {
      console.error('❌ Error seeding contact messages:', contactError.message)
      return NextResponse.json(
        { error: `Contact messages seeding failed: ${contactError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Contact messages seeded successfully')
    console.log('🎉 Database seeding completed!')

    return NextResponse.json({ success: true, message: 'Database seeded successfully' })

  } catch (error) {
    console.error('❌ Unexpected error during seeding:', error)
    return NextResponse.json(
      { error: 'Unexpected error during seeding' },
      { status: 500 }
    )
  }
}
