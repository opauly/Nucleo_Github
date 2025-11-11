import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  ArrowLeft, 
  Mail, 
  Calendar, 
  MapPin, 
  Clock,
  User,
  Crown,
  CheckCircle,
  AlertCircle,
  Target,
  Eye,
  Phone,
  CalendarDays
} from 'lucide-react'
import { TeamJoinButton } from '@/components/ui/team-join-button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface TeamMember {
  profile_id: string
  role: string
  team_leader: boolean
  status: string
  joined_at: string
  profiles: {
    id: string
    nombre: string
    apellido1: string
    apellido2: string | null
    email: string
    role: string
  } | null
}

interface Team {
  id: string
  name: string
  description: string
  email_contacto: string | null
  mission?: string
  vision?: string
  requirements?: string
  meeting_schedule?: string
  contact_person?: string
  phone?: string
  image_url?: string
  is_featured: boolean
  max_members?: number
  status: string
  created_at: string
  updated_at: string
  team_members: TeamMember[]
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  if (supabase) {
    const { data: team } = await supabase
      .from('teams')
      .select('name, description')
      .eq('id', params.id)
      .single()

    if (team) {
      return {
        title: `${team.name} - Núcleo`,
        description: team.description,
      }
    }
  }

  return {
    title: 'Equipo - Núcleo',
    description: 'Conoce más sobre este equipo de nuestra comunidad.',
  }
}

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  let team: Team | null = null
  let error = null

  if (supabase) {
    const { data, error: fetchError } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        description,
        email_contacto,
        mission,
        vision,
        requirements,
        meeting_schedule,
        contact_person,
        phone,
        image_url,
        is_featured,
        max_members,
        status,
        created_at,
        updated_at,
        team_members (
          profile_id,
          role,
          team_leader,
          status,
          joined_at,
          profiles (
            id,
            nombre,
            apellido1,
            apellido2,
            email,
            role
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (fetchError) {
      error = fetchError.message
    } else {
      team = data
    }
  }

  if (error || !team) {
    notFound()
  }

  // Fetch team events
  let teamEvents: any[] = []
  if (supabase) {
    const { data: eventsData, error: eventsError } = await supabase
      .from('event_teams')
      .select(`
        events (
          id,
          title,
          description,
          start_date,
          end_date,
          location,
          image_url,
          is_featured,
          status
        )
      `)
      .eq('team_id', params.id)
      .order('events(start_date)', { ascending: true })

    if (!eventsError && eventsData) {
      teamEvents = eventsData
        .map(item => item.events)
        .filter(event => event && event.status === 'published')
    }
  }

  // Filter out members with null profiles and only approved members
  const approvedMembers = team.team_members.filter(member => 
    member.status === 'approved' && member.profiles !== null
  )
  const leaders = approvedMembers.filter(member => member.team_leader)
  const regularMembers = approvedMembers.filter(member => !member.team_leader)

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/equipos">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver a Equipos
              </Button>
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-2">
                    {team.name}
                  </h1>
                  <div className="flex items-center gap-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {approvedMembers.length} miembros
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Creado {new Date(team.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <TeamJoinButton
                teamId={team.id}
                teamName={team.name}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Sobre el Equipo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: team.description }}
                    />
                  </CardContent>
                </Card>

                {/* Mission */}
                {team.mission && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Misión
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed">{team.mission}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Vision */}
                {team.vision && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Visión
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed">{team.vision}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Requirements */}
                {team.requirements && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Requisitos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 leading-relaxed">{team.requirements}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Team Members */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Miembros del Equipo ({approvedMembers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {approvedMembers.length === 0 ? (
                      <p className="text-slate-600 text-center py-8">
                        Este equipo aún no tiene miembros aprobados.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {/* Leaders */}
                        {leaders.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                              <Crown className="w-4 h-4 text-yellow-600" />
                              Líderes
                            </h4>
                            <div className="grid gap-3">
                              {leaders.map((member) => (
                                <div key={member.profile_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-900">
                                        {member.profiles?.nombre || 'Usuario'} {member.profiles?.apellido1 || ''} {member.profiles?.apellido2 || ''}
                                      </p>
                                      <p className="text-sm text-slate-600">{member.profiles?.email || 'Email no disponible'}</p>
                                    </div>
                                  </div>
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Líder
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Regular Members */}
                        {regularMembers.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              Miembros
                            </h4>
                            <div className="grid gap-3">
                              {regularMembers.map((member) => (
                                <div key={member.profile_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-900">
                                        {member.profiles?.nombre || 'Usuario'} {member.profiles?.apellido1 || ''} {member.profiles?.apellido2 || ''}
                                      </p>
                                      <p className="text-sm text-slate-600">{member.profiles?.email || 'Email no disponible'}</p>
                                    </div>
                                  </div>
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                    {member.role}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Team Events */}
                {teamEvents.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        Eventos del Equipo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {teamEvents.map((event) => {
                          const now = new Date()
                          const startDate = new Date(event.start_date)
                          const endDate = event.end_date ? new Date(event.end_date) : null
                          
                          // An event is upcoming if end_date (if exists) > now OR start_date > now
                          const isUpcoming = (endDate && endDate > now) || startDate > now
                          // An event is past if end_date (if exists) <= now OR (!end_date && start_date <= now)
                          const isPast = (endDate && endDate <= now) || (!endDate && startDate <= now)
                          
                          return (
                            <div key={event.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-slate-900 line-clamp-1">
                                  {event.title}
                                </h4>
                                <div className="flex gap-2">
                                  {event.is_featured && (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                      Destacado
                                    </Badge>
                                  )}
                                  {isUpcoming && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                      Próximo
                                    </Badge>
                                  )}
                                  {isPast && (
                                    <Badge className="bg-slate-100 text-slate-800 border-slate-200 text-xs">
                                      Pasado
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {event.description && (
                                <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                                  {event.description.replace(/<[^>]*>/g, '')}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(event.start_date).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {new Date(event.start_date).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="line-clamp-1">{event.location}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex justify-end">
                                <Link href={`/eventos/${event.id}`}>
                                  <Button size="sm" variant="outline">
                                    Ver Detalles
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                {(team.email_contacto || team.contact_person || team.phone) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Contacto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {team.contact_person && (
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-slate-600" />
                            <span className="text-slate-900">{team.contact_person}</span>
                          </div>
                        )}
                        {team.email_contacto && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-slate-600" />
                            <span className="text-slate-900">{team.email_contacto}</span>
                          </div>
                        )}
                        {team.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-600" />
                            <span className="text-slate-900">{team.phone}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Meeting Schedule */}
                {team.meeting_schedule && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Horario de Reuniones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700">{team.meeting_schedule}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Team Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Estadísticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Total Miembros</span>
                        <span className="font-semibold text-slate-900">
                          {approvedMembers.length}
                          {team.max_members && ` / ${team.max_members}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Líderes</span>
                        <span className="font-semibold text-slate-900">{leaders.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Miembros Regulares</span>
                        <span className="font-semibold text-slate-900">{regularMembers.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Estado</span>
                        <Badge className={
                          team.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                          team.status === 'recruiting' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }>
                          {team.status === 'active' ? 'Activo' :
                           team.status === 'recruiting' ? 'Reclutando' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Creado</span>
                        <span className="font-semibold text-slate-900">
                          {new Date(team.created_at).toLocaleDateString('es-ES', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Join Team CTA */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">¿Te interesa unirte?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-800 text-sm mb-4">
                      Si sientes que este equipo es para ti, ¡no dudes en solicitar unirte!
                    </p>
                    <TeamJoinButton
                      teamId={team.id}
                      teamName={team.name}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
