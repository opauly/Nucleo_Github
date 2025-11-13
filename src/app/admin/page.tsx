"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Users, 
  Shield, 
  Crown, 
  Settings, 
  FileText, 
  Calendar,
  UserCheck,
  UserX,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  BarChart3,
  PieChart,
  UserPlus,
  Mail
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { UserManagement } from '@/components/admin/user-management'
import { TeamContentManagement } from '@/components/admin/team-content-management'
import { AnalyticsModal } from '@/components/admin/analytics-modal'
import { AttendanceDashboard } from '@/components/admin/attendance-dashboard'
import { getUserRole, isAdmin } from '@/lib/auth/role-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalTeams: number
  pendingApprovals: number
  totalEvents: number
  totalAnnouncements: number
  totalDevotionals: number
  // Enhanced analytics
  newUsersThisMonth: number
  totalEventRegistrations: number
  upcomingEvents: number
  draftContent: number
  teamMemberships: number
  contactMessagesThisMonth: number
  // Role breakdown
  membersCount: number
  staffCount: number
  adminsCount: number
  superAdminsCount: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsModal, setAnalyticsModal] = useState<{
    isOpen: boolean
    type: 'users' | 'activity' | 'content' | 'registrations'
  }>({
    isOpen: false,
    type: 'users'
  })
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeams: 0,
    pendingApprovals: 0,
    totalEvents: 0,
    totalAnnouncements: 0,
    totalDevotionals: 0,
    newUsersThisMonth: 0,
    totalEventRegistrations: 0,
    upcomingEvents: 0,
    draftContent: 0,
    teamMemberships: 0,
    contactMessagesThisMonth: 0,
    membersCount: 0,
    staffCount: 0,
    adminsCount: 0,
    superAdminsCount: 0
  })

  useEffect(() => {
    if (user) {
      checkUserRole()
      fetchDashboardStats()
    } else if (!loading) {
      // User is not logged in, redirect to login
      router.push('/iniciar-sesion')
    }
  }, [user, loading])

  const checkUserRole = async () => {
    if (!user) return

    try {
      // For now, let's directly check if the user is opaulyc@gmail.com
      if (user.email === 'opaulyc@gmail.com') {
        setUserRole({
          role: 'Admin',
          super_admin: true
        })
        setLoading(false)
        return
      }

      // For other users, try the server-side API
      const response = await fetch('/api/admin/debug-user-role', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Debug user role result:', result)
        
        if (result.success && result.user) {
          setUserRole({
            role: result.user.role,
            super_admin: result.user.super_admin
          })
        } else {
          // Fallback to client-side check
          const role = await getUserRole(user.id)
          setUserRole(role)
        }
      } else {
        // Fallback to client-side check
        const role = await getUserRole(user.id)
        setUserRole(role)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      // Fallback to client-side check
      try {
        const role = await getUserRole(user.id)
        setUserRole(role)
      } catch (fallbackError) {
        console.error('Fallback error checking user role:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    if (!user) return

    try {
      // Fetch basic stats
      const supabase = (await import('@/lib/supabase/client')).createClient()
      
      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get team count
      const { count: teamCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })

      // Get pending team memberships
      const { count: pendingTeamMemberships } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Get pending event registrations
      const { count: pendingEventRegistrations } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Total pending approvals = team memberships + event registrations
      const pendingCount = (pendingTeamMemberships || 0) + (pendingEventRegistrations || 0)

      // Get event count
      const { count: eventCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })

      // Get announcement count
      const { count: announcementCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })

      // Get devotional count
      const { count: devotionalCount } = await supabase
        .from('devotionals')
        .select('*', { count: 'exact', head: true })

      // Enhanced analytics
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      // New users this month
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString())

      // Total event registrations
      const { count: totalEventRegistrations } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })

      // Upcoming events (using end_date if available, otherwise start_date)
      const now = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      
      // Get all events and filter by end_date
      const { data: allEvents } = await supabase
        .from('events')
        .select('id, start_date, end_date')
      
      const upcomingEventsCount = allEvents?.filter((event: { id: string; start_date: string; end_date: string | null }) => {
        const eventEndDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date)
        return eventEndDate >= now && eventEndDate <= thirtyDaysFromNow
      }).length || 0

      // Contact messages this month
      const { count: contactMessagesThisMonth } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString())

      // Role breakdown
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('role, super_admin')
      
      let membersCount = 0
      let staffCount = 0
      let adminsCount = 0
      let superAdminsCount = 0
      
      allProfiles?.forEach((profile: { role: string; super_admin: boolean }) => {
        if (profile.super_admin) {
          superAdminsCount++
        } else if (profile.role === 'Admin') {
          adminsCount++
        } else if (profile.role === 'Staff') {
          staffCount++
        } else {
          membersCount++
        }
      })

      // Draft content (pending content)
      const { count: draftAnnouncements } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft')
      
      const { count: draftDevotionals } = await supabase
        .from('devotionals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft')

      // Team memberships
      const { count: teamMemberships } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

      setStats({
        totalUsers: userCount || 0,
        totalTeams: teamCount || 0,
        pendingApprovals: pendingCount || 0,
        totalEvents: eventCount || 0,
        totalAnnouncements: announcementCount || 0,
        totalDevotionals: devotionalCount || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        totalEventRegistrations: totalEventRegistrations || 0,
        upcomingEvents: upcomingEventsCount,
        draftContent: (draftAnnouncements || 0) + (draftDevotionals || 0),
        teamMemberships: teamMemberships || 0,
        contactMessagesThisMonth: contactMessagesThisMonth || 0,
        membersCount,
        staffCount,
        adminsCount,
        superAdminsCount
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  // Navigation functions for clickable cards
  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'users':
        // Navigate to users tab
        const usersTab = document.querySelector('[data-value="users"]') as HTMLElement
        if (usersTab) usersTab.click()
        break
      case 'teams':
        // Navigate to teams tab
        const teamsTab = document.querySelector('[data-value="teams"]') as HTMLElement
        if (teamsTab) teamsTab.click()
        break
      case 'pending':
        // Navigate to approvals tab
        const approvalsTab = document.querySelector('[data-value="approvals"]') as HTMLElement
        if (approvalsTab) approvalsTab.click()
        break
      case 'events':
        // Navigate to events tab
        const eventsTab = document.querySelector('[data-value="events"]') as HTMLElement
        if (eventsTab) eventsTab.click()
        break
      case 'announcements':
        // Navigate to announcements management
        router.push('/admin/content/announcements')
        break
      case 'devotionals':
        // Navigate to devotionals management
        router.push('/admin/content/devotionals')
        break
      case 'content':
        // Navigate to content tab
        const contentTab = document.querySelector('[data-value="content"]') as HTMLElement
        if (contentTab) contentTab.click()
        break
      case 'analytics-users':
        // Open users analytics modal
        setAnalyticsModal({ isOpen: true, type: 'users' })
        break
      case 'analytics-activity':
        // Open activity analytics modal
        setAnalyticsModal({ isOpen: true, type: 'activity' })
        break
      case 'analytics-content':
        // Open content analytics modal
        setAnalyticsModal({ isOpen: true, type: 'content' })
        break
      case 'analytics-registrations':
        // Open registrations analytics modal
        setAnalyticsModal({ isOpen: true, type: 'registrations' })
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Check if user is logged in (redirect handled in useEffect)
  if (!loading && !user) {
    return null
  }

  // Check if user has admin access
  if (!loading && (!userRole || (userRole.role !== 'Admin' && !userRole.super_admin))) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
            <p className="text-slate-600 text-center max-w-md mb-4">
              No tienes permisos para acceder al panel de administración. 
              Solo los administradores pueden ver esta página.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Volver al Inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
          {userRole.super_admin && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Crown className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          )}
        </div>
        <p className="text-slate-600">
          Bienvenido, {userRole.super_admin ? 'Super Administrador' : 'Administrador'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Pendientes */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-slate-50"
          onClick={() => handleCardClick('pending')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pendientes</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingApprovals}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs text-yellow-600">Requieren atención</span>
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Usuarios */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-slate-50"
          onClick={() => handleCardClick('users')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600">Total registrados</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Nuevos Usuarios */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-slate-50"
          onClick={() => handleCardClick('users')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Nuevos Usuarios</p>
                <p className="text-2xl font-bold text-slate-900">{stats.newUsersThisMonth}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">Último mes</span>
                </div>
              </div>
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-slate-50"
          onClick={() => handleCardClick('users')}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 mb-2">Roles</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900">{stats.membersCount}</span>
                    <span className="text-slate-600">Miembros</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900">{stats.staffCount}</span>
                    <span className="text-slate-600">Staff</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900">{stats.adminsCount}</span>
                    <span className="text-slate-600">Admins</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900">{stats.superAdminsCount}</span>
                    <span className="text-slate-600">Super Admins</span>
                  </div>
                </div>
              </div>
              <Shield className="w-8 h-8 text-purple-600 ml-4 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Equipos */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-slate-50"
          onClick={() => handleCardClick('teams')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Equipos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalTeams}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">{stats.teamMemberships} miembros</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Contenido Pendiente */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-slate-50"
          onClick={() => handleCardClick('content')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Contenido Pendiente</p>
                <p className="text-2xl font-bold text-slate-900">{stats.draftContent}</p>
                <div className="flex items-center gap-1 mt-1">
                  <FileText className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-600">Borradores</span>
                </div>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-slate-50"
          onClick={() => handleCardClick('events')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Próximos Eventos</p>
                <p className="text-2xl font-bold text-slate-900">{stats.upcomingEvents}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600">Próximos 30 días</span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Formularios de Contacto */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-slate-50"
          onClick={() => router.push('/admin/contacto')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Formularios de Contacto</p>
                <p className="text-2xl font-bold text-slate-900">{stats.contactMessagesThisMonth}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600">Último mes</span>
                </div>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Equipos
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Publicaciones
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Aprobaciones
            {stats.pendingApprovals > 0 && (
              <Badge className="ml-1 bg-yellow-500 text-white text-xs">
                {stats.pendingApprovals}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <TeamContentManagement />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Gestión de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Total de Eventos</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalEvents}</p>
                    <p className="text-sm text-slate-600">{stats.upcomingEvents} próximos</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <Button asChild className="w-full" size="lg">
                  <a href="/admin/content/events">Gestionar Eventos</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <AttendanceDashboard />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Anuncios ({stats.totalAnnouncements})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="/admin/content/announcements">Gestionar Anuncios</a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Devocionales ({stats.totalDevotionals})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="/admin/content/devotionals">Gestionar Devocionales</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Aprobaciones Pendientes
                {stats.pendingApprovals > 0 && (
                  <Badge className="ml-2 bg-yellow-500 text-white">
                    {stats.pendingApprovals}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Requieren Atención</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.pendingApprovals}</p>
                    <p className="text-sm text-slate-600">Equipos y eventos pendientes</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
                <Button asChild className="w-full" size="lg">
                  <a href="/admin/approvals">Ver Todas las Aprobaciones</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={analyticsModal.isOpen}
        onClose={() => setAnalyticsModal({ isOpen: false, type: 'users' })}
        type={analyticsModal.type}
      />
    </div>
  )
}
