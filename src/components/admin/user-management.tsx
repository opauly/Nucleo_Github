"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Users, Shield, Crown, User } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

interface User {
  id: string
  email: string
  nombre: string
  apellido1: string
  apellido2: string | null
  role: 'Miembro' | 'Staff' | 'Admin'
  super_admin?: boolean
  created_at: string
  updated_at: string
}

export function UserManagement() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      // For opaulyc@gmail.com, bypass the authorization check
      if (user?.email === 'opaulyc@gmail.com') {
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${user?.id}`,
            'X-Super-Admin': 'true'
          }
        })
        const result = await response.json()

        if (response.ok) {
          setUsers(result.users || [])
        } else {
          toast.error(result.error || 'Error al cargar usuarios')
        }
      } else {
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${user?.id}`
          }
        })
        const result = await response.json()

        if (response.ok) {
          setUsers(result.users || [])
        } else {
          toast.error(result.error || 'Error al cargar usuarios')
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: string, superAdmin?: boolean) => {
    if (!user) return

    setUpdatingUser(userId)

    try {
      const headers: any = {
        'Content-Type': 'application/json',
      }
      
      if (user?.email === 'opaulyc@gmail.com') {
        headers['X-Super-Admin'] = 'true'
      }
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          userId: user.id,
          targetUserId: userId,
          role,
          superAdmin
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        fetchUsers() // Refresh the list
      } else {
        toast.error(result.error || 'Error al actualizar rol')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Error de conexión')
    } finally {
      setUpdatingUser(null)
    }
  }

  const getRoleIcon = (role: string, superAdmin?: boolean) => {
    if (superAdmin) return <Crown className="w-4 h-4 text-yellow-600" />
    if (role === 'Admin') return <Shield className="w-4 h-4 text-blue-600" />
    if (role === 'Staff') return <Users className="w-4 h-4 text-green-600" />
    return <User className="w-4 h-4 text-slate-600" />
  }

  const getRoleBadge = (role: string, superAdmin?: boolean) => {
    if (superAdmin) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Super Admin</Badge>
    }
    switch (role) {
      case 'Admin':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Admin</Badge>
      case 'Staff':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Staff</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Miembro</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestión de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-32"></div>
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gestión de Usuarios ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {users.map((userItem) => (
          <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getRoleIcon(userItem.role, userItem.super_admin)}
              <div>
                <p className="font-medium">
                  {userItem.nombre} {userItem.apellido1}
                  {userItem.apellido2 && ` ${userItem.apellido2}`}
                </p>
                <p className="text-sm text-slate-600">{userItem.email}</p>
                <p className="text-xs text-slate-500">
                  Miembro desde {formatDate(userItem.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {getRoleBadge(userItem.role, userItem.super_admin)}
              
              <Select
                value={userItem.role}
                onValueChange={(value) => updateUserRole(userItem.id, value)}
                disabled={updatingUser === userItem.id}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Miembro">Miembro</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              {userItem.role === 'Admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateUserRole(userItem.id, 'Admin', !userItem.super_admin)}
                  disabled={updatingUser === userItem.id}
                >
                  {userItem.super_admin ? 'Quitar Super Admin' : 'Hacer Super Admin'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
