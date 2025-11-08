"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Minus, Plus, Users, User } from 'lucide-react'

interface AttendanceCounterProps {
  adults: number
  teens: number
  kids: number
  onAdultsChange: (value: number) => void
  onTeensChange: (value: number) => void
  onKidsChange: (value: number) => void
}

export function AttendanceCounter({
  adults,
  teens,
  kids,
  onAdultsChange,
  onTeensChange,
  onKidsChange
}: AttendanceCounterProps) {
  const handleIncrement = (type: 'adults' | 'teens' | 'kids') => {
    if (type === 'adults') {
      onAdultsChange(adults + 1)
    } else if (type === 'teens') {
      onTeensChange(teens + 1)
    } else {
      onKidsChange(kids + 1)
    }
  }

  const handleDecrement = (type: 'adults' | 'teens' | 'kids') => {
    if (type === 'adults') {
      onAdultsChange(Math.max(0, adults - 1))
    } else if (type === 'teens') {
      onTeensChange(Math.max(0, teens - 1))
    } else {
      onKidsChange(Math.max(0, kids - 1))
    }
  }

  const handleInputChange = (type: 'adults' | 'teens' | 'kids', value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue < 0) return

    if (type === 'adults') {
      onAdultsChange(numValue)
    } else if (type === 'teens') {
      onTeensChange(numValue)
    } else {
      onKidsChange(numValue)
    }
  }

  const CounterCard = ({ 
    label, 
    value, 
    icon, 
    color, 
    onIncrement, 
    onDecrement, 
    onChange 
  }: {
    label: string
    value: number
    icon: React.ReactNode
    color: string
    onIncrement: () => void
    onDecrement: () => void
    onChange: (value: string) => void
  }) => (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className={`${color} p-3 rounded-full`}>
            {icon}
          </div>
          <Label className="text-lg font-semibold">{label}</Label>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={onDecrement}
              className="h-12 w-12"
              disabled={value === 0}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <Input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-24 text-center text-2xl font-bold"
              min="0"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={onIncrement}
              className="h-12 w-12"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CounterCard
        label="Adultos"
        value={adults}
        icon={<Users className="h-8 w-8 text-blue-600" />}
        color="bg-blue-100"
        onIncrement={() => handleIncrement('adults')}
        onDecrement={() => handleDecrement('adults')}
        onChange={(value) => handleInputChange('adults', value)}
      />
      <CounterCard
        label="Jóvenes"
        value={teens}
        icon={<User className="h-8 w-8 text-green-600" />}
        color="bg-green-100"
        onIncrement={() => handleIncrement('teens')}
        onDecrement={() => handleDecrement('teens')}
        onChange={(value) => handleInputChange('teens', value)}
      />
      <CounterCard
        label="Niños"
        value={kids}
        icon={<Users className="h-8 w-8 text-orange-600" />}
        color="bg-orange-100"
        onIncrement={() => handleIncrement('kids')}
        onDecrement={() => handleDecrement('kids')}
        onChange={(value) => handleInputChange('kids', value)}
      />
    </div>
  )
}

