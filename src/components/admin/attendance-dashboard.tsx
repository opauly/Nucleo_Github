"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AttendanceChart } from '@/components/admin/attendance-chart'
import { useAuth } from '@/lib/auth/auth-context'
import { Users, TrendingUp, TrendingDown, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface AttendanceStats {
  lastRecord: {
    attendance_date: string
    adults_count: number
    teens_count: number
    kids_count: number
    total_count: number
  } | null
  totalRecords: number
  averageAttendance: number
  growth: number
  highestRecord: {
    attendance_date: string
    total_count: number
  } | null
}

export function AttendanceDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchRecords()
    }
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/admin/attendance/stats', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setStats(result.stats)
      } else {
        console.error('Error fetching attendance stats')
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecords = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/admin/attendance?limit=50', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setRecords(result.records || [])
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-48"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Última Asistencia</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.lastRecord?.total_count || 0}
                </p>
                {stats.lastRecord && (
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(stats.lastRecord.attendance_date).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Promedio (4 semanas)</p>
                <p className="text-2xl font-bold text-slate-900">{stats.averageAttendance}</p>
                <p className="text-xs text-slate-500 mt-1">personas</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Crecimiento</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-slate-900">{stats.growth > 0 ? '+' : ''}{stats.growth}%</p>
                  {stats.growth > 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : stats.growth < 0 ? (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 mt-1">vs. semana anterior</p>
              </div>
              {stats.growth > 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Récord</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.highestRecord?.total_count || 0}
                </p>
                {stats.highestRecord && (
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(stats.highestRecord.attendance_date).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <AttendanceChart records={records} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin/attendance">
              Registrar Nueva Asistencia
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

