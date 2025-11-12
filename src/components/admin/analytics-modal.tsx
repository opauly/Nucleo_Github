"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Clock,
  CheckCircle,
  X,
  BarChart3,
  PieChart,
  Eye,
  FileText
} from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalEventRegistrations: number
  recentActivity: number
  publishedContent: number
  draftContent: number
  userGrowth: Array<{ month: string; count: number }>
  activityBreakdown: Array<{ type: string; count: number }>
  contentBreakdown: Array<{ type: string; published: number; drafts: number }>
}

interface AnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'users' | 'activity' | 'content' | 'registrations'
}

export function AnalyticsModal({ isOpen, onClose, type }: AnalyticsModalProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchAnalyticsData()
    }
  }, [isOpen, type])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Simulate API call - in real implementation, this would fetch from your API
      const mockData: AnalyticsData = {
        totalUsers: 1,
        activeUsers: 0,
        newUsersThisMonth: 0,
        totalEventRegistrations: 2,
        recentActivity: 2,
        publishedContent: 0,
        draftContent: 0,
        userGrowth: [
          { month: 'Ene', count: 0 },
          { month: 'Feb', count: 0 },
          { month: 'Mar', count: 0 },
          { month: 'Abr', count: 1 },
          { month: 'May', count: 0 },
          { month: 'Jun', count: 0 }
        ],
        activityBreakdown: [
          { type: 'Registros a Eventos', count: 2 },
          { type: 'Solicitudes de Equipos', count: 1 },
          { type: 'Contenido Creado', count: 0 }
        ],
        contentBreakdown: [
          { type: 'Anuncios', published: 0, drafts: 0 },
          { type: 'Devocionales', published: 0, drafts: 0 },
          { type: 'Eventos', published: 6, drafts: 0 }
        ]
      }
      setData(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getModalTitle = () => {
    switch (type) {
      case 'users': return 'Análisis de Usuarios'
      case 'activity': return 'Actividad Reciente'
      case 'content': return 'Análisis de Contenido'
      case 'registrations': return 'Registros y Participación'
      default: return 'Análisis'
    }
  }

  const getModalIcon = () => {
    switch (type) {
      case 'users': return <Users className="w-5 h-5" />
      case 'activity': return <Activity className="w-5 h-5" />
      case 'content': return <FileText className="w-5 h-5" />
      case 'registrations': return <CheckCircle className="w-5 h-5" />
      default: return <BarChart3 className="w-5 h-5" />
    }
  }

  if (!data) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getModalIcon()}
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {type === 'users' && (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Total Usuarios</p>
                          <p className="text-2xl font-bold text-slate-900">{data.totalUsers}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Usuarios Activos</p>
                          <p className="text-2xl font-bold text-slate-900">{data.activeUsers}</p>
                        </div>
                        <Activity className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Nuevos Este Mes</p>
                          <p className="text-2xl font-bold text-slate-900">{data.newUsersThisMonth}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {type === 'activity' && (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Actividad Total</p>
                          <p className="text-2xl font-bold text-slate-900">{data.recentActivity}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Registros</p>
                          <p className="text-2xl font-bold text-slate-900">{data.totalEventRegistrations}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Usuarios Activos</p>
                          <p className="text-2xl font-bold text-slate-900">{data.activeUsers}</p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {type === 'content' && (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Contenido Publicado</p>
                          <p className="text-2xl font-bold text-slate-900">{data.publishedContent}</p>
                        </div>
                        <Eye className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Borradores</p>
                          <p className="text-2xl font-bold text-slate-900">{data.draftContent}</p>
                        </div>
                        <FileText className="w-8 h-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Total Contenido</p>
                          <p className="text-2xl font-bold text-slate-900">{data.publishedContent + data.draftContent}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {type === 'registrations' && (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Total Registros</p>
                          <p className="text-2xl font-bold text-slate-900">{data.totalEventRegistrations}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Eventos Activos</p>
                          <p className="text-2xl font-bold text-slate-900">6</p>
                        </div>
                        <Calendar className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Promedio por Evento</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {data.totalEventRegistrations > 0 ? (data.totalEventRegistrations / 6).toFixed(1) : '0'}
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Detailed Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Desglose Detallado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {type === 'activity' && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Tipos de Actividad</h4>
                      <div className="space-y-2">
                        {data.activityBreakdown.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="font-medium text-slate-900">{item.type}</span>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {item.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {type === 'content' && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Contenido por Tipo</h4>
                      <div className="space-y-2">
                        {data.contentBreakdown.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="font-medium text-slate-900">{item.type}</span>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {item.published} publicados
                              </Badge>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                {item.drafts} borradores
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {type === 'users' && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Crecimiento de Usuarios</h4>
                      <div className="grid grid-cols-6 gap-2">
                        {data.userGrowth.map((item, index) => (
                          <div key={index} className="text-center p-2 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-600">{item.month}</p>
                            <p className="text-lg font-bold text-slate-900">{item.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              {type === 'users' && (
                <Button onClick={() => {
                  onClose()
                  // Navigate to users tab
                  const usersTab = document.querySelector('[data-value="users"]') as HTMLElement
                  if (usersTab) usersTab.click()
                }}>
                  Gestionar Usuarios
                </Button>
              )}
              {type === 'content' && (
                <Button onClick={() => {
                  onClose()
                  // Navigate to content tab
                  const contentTab = document.querySelector('[data-value="content"]') as HTMLElement
                  if (contentTab) contentTab.click()
                }}>
                  Gestionar Contenido
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}



