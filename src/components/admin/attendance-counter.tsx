"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Minus, Plus, Users, User, Baby, UserPlus } from 'lucide-react'

interface AttendanceCounterProps {
  adults: number
  teens: number
  kids: number
  babies: number
  newPeople: number
  onAdultsChange: (value: number) => void
  onTeensChange: (value: number) => void
  onKidsChange: (value: number) => void
  onBabiesChange: (value: number) => void
  onNewPeopleChange: (value: number) => void
}

export function AttendanceCounter({
  adults,
  teens,
  kids,
  babies,
  newPeople,
  onAdultsChange,
  onTeensChange,
  onKidsChange,
  onBabiesChange,
  onNewPeopleChange
}: AttendanceCounterProps) {
  const handleIncrement = (type: 'adults' | 'teens' | 'kids' | 'babies' | 'newPeople') => {
    if (type === 'adults') {
      onAdultsChange(adults + 1)
    } else if (type === 'teens') {
      onTeensChange(teens + 1)
    } else if (type === 'kids') {
      onKidsChange(kids + 1)
    } else if (type === 'babies') {
      onBabiesChange(babies + 1)
    } else {
      onNewPeopleChange(newPeople + 1)
    }
  }

  const handleDecrement = (type: 'adults' | 'teens' | 'kids' | 'babies' | 'newPeople') => {
    if (type === 'adults') {
      onAdultsChange(Math.max(0, adults - 1))
    } else if (type === 'teens') {
      onTeensChange(Math.max(0, teens - 1))
    } else if (type === 'kids') {
      onKidsChange(Math.max(0, kids - 1))
    } else if (type === 'babies') {
      onBabiesChange(Math.max(0, babies - 1))
    } else {
      onNewPeopleChange(Math.max(0, newPeople - 1))
    }
  }

  const handleInputChange = (type: 'adults' | 'teens' | 'kids' | 'babies' | 'newPeople', value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue < 0) return

    if (type === 'adults') {
      onAdultsChange(numValue)
    } else if (type === 'teens') {
      onTeensChange(numValue)
    } else if (type === 'kids') {
      onKidsChange(numValue)
    } else if (type === 'babies') {
      onBabiesChange(numValue)
    } else {
      onNewPeopleChange(numValue)
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
  }) => {
    const [inputValue, setInputValue] = useState(value.toString())
    const [isEditing, setIsEditing] = useState(false)

    // Sync input value when prop changes (but not while editing)
    useEffect(() => {
      if (!isEditing) {
        setInputValue(value.toString())
      }
    }, [value, isEditing])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      // Allow empty string for typing
      if (newValue === '') {
        return
      }
      // Only update parent if it's a valid number
      const numValue = parseInt(newValue)
      if (!isNaN(numValue) && numValue >= 0) {
        onChange(newValue)
      }
    }

    const handleBlur = () => {
      setIsEditing(false)
      // Ensure we have a valid number on blur
      const numValue = parseInt(inputValue)
      if (isNaN(numValue) || numValue < 0) {
        setInputValue(value.toString())
      } else {
        onChange(inputValue)
      }
    }

    const handleFocus = () => {
      setIsEditing(true)
    }

    return (
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-col items-center space-y-3">
            <div className={`${color} p-2 rounded-full`}>
              {icon}
            </div>
            <Label className="text-base font-semibold">{label}</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onDecrement}
                className="h-10 w-10"
                disabled={value === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                inputMode="numeric"
                value={isEditing ? inputValue : value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                className="w-20 text-center text-xl font-bold"
                min="0"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={onIncrement}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      <CounterCard
        label="Adultos"
        value={adults}
        icon={<Users className="h-5 w-5 text-blue-600" />}
        color="bg-blue-100"
        onIncrement={() => handleIncrement('adults')}
        onDecrement={() => handleDecrement('adults')}
        onChange={(value) => handleInputChange('adults', value)}
      />
      <CounterCard
        label="Teens"
        value={teens}
        icon={<User className="h-5 w-5 text-green-600" />}
        color="bg-green-100"
        onIncrement={() => handleIncrement('teens')}
        onDecrement={() => handleDecrement('teens')}
        onChange={(value) => handleInputChange('teens', value)}
      />
      <CounterCard
        label="Niños"
        value={kids}
        icon={<Users className="h-5 w-5 text-orange-600" />}
        color="bg-orange-100"
        onIncrement={() => handleIncrement('kids')}
        onDecrement={() => handleDecrement('kids')}
        onChange={(value) => handleInputChange('kids', value)}
      />
      <CounterCard
        label="Bebés"
        value={babies}
        icon={<Baby className="h-5 w-5 text-pink-600" />}
        color="bg-pink-100"
        onIncrement={() => handleIncrement('babies')}
        onDecrement={() => handleDecrement('babies')}
        onChange={(value) => handleInputChange('babies', value)}
      />
      <CounterCard
        label="Personas Nuevas"
        value={newPeople}
        icon={<UserPlus className="h-5 w-5 text-purple-600" />}
        color="bg-purple-100"
        onIncrement={() => handleIncrement('newPeople')}
        onDecrement={() => handleDecrement('newPeople')}
        onChange={(value) => handleInputChange('newPeople', value)}
      />
    </div>
  )
}

