"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '@/lib/auth/auth-context'
import { Calendar, TrendingUp } from 'lucide-react'

interface AttendanceRecord {
  id: string
  attendance_date: string
  adults_count: number
  teens_count: number
  kids_count: number
  babies_count: number
  new_people_count: number
  total_count: number
}

interface AttendanceChartProps {
  records: AttendanceRecord[]
  onDateRangeChange?: (dateRange: 'month' | '3months' | '6months' | 'year' | 'all') => void
}

export function AttendanceChart({ records, onDateRangeChange }: AttendanceChartProps) {
  const [dateRange, setDateRange] = useState<'month' | '3months' | '6months' | 'year' | 'all'>('3months')

  const handleDateRangeChange = (value: 'month' | '3months' | '6months' | 'year' | 'all') => {
    setDateRange(value)
    if (onDateRangeChange) {
      onDateRangeChange(value)
    }
  }

  const getFilteredRecords = () => {
    if (!records || records.length === 0) return []

    const now = new Date()
    let cutoffDate = new Date()

    switch (dateRange) {
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        return records
    }

    return records.filter(record => {
      const recordDate = new Date(record.attendance_date)
      return recordDate >= cutoffDate
    })
  }

  // Expose date range change to parent component on mount and when it changes
  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(dateRange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  const formatChartData = () => {
    const filtered = getFilteredRecords()
    
    return filtered
      .sort((a, b) => new Date(a.attendance_date).getTime() - new Date(b.attendance_date).getTime())
      .map(record => ({
        date: new Date(record.attendance_date).toLocaleDateString('es-ES', {
          month: 'short',
          day: 'numeric'
        }),
        fullDate: record.attendance_date,
        Adultos: record.adults_count,
        Teens: record.teens_count,
        Niños: record.kids_count,
        Bebés: record.babies_count || 0,
        'Personas Nuevas': record.new_people_count || 0,
        Total: record.total_count
      }))
  }

  const chartData = formatChartData()

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Gráfico de Asistencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-slate-500">
            No hay datos de asistencia para mostrar
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Gráfico de Asistencia
          </CardTitle>
          <Select value={dateRange} onValueChange={(value: any) => handleDateRangeChange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              formatter={(value: any, name: string) => [value, name]}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Adultos" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Teens" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Niños" 
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Bebés" 
              stroke="#ec4899" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Personas Nuevas" 
              stroke="#a855f7" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Total" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

