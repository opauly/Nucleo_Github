"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Users, Shield, Crown, User, Plus } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { AddNewMemberModal } from './add-new-member-modal'

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
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [currentUserIsSuperAdmin, setCurrentUserIsSuperAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      checkCurrentUserRole()
      fetchUsers()
    }
  }, [user])

  const checkCurrentUserRole = async () => {
    if (!user) return
    
    // Check if current user is super admin
    if (user.email === 'opaulyc@gmail.com') {
      setCurrentUserIsSuperAdmin(true)
      return
    }

    try {
      const response = await fetch('/api/admin/debug-user-role', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'x-super-admin': 'true'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.user?.super_admin) {
          setCurrentUserIsSuperAdmin(true)
        }
      }
    } catch (error) {
      console.error('Error checking super admin status:', error)
    }
  }

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

  const updateUserRole = async (userId: string, selectedValue: string) => {
    if (!user) return

    setUpdatingUser(userId)

    // Parse the selected value - if it's "Super Admin", set role to Admin and superAdmin to true
    let role = selectedValue
    let superAdmin = false
    
    if (selectedValue === 'Super Admin') {
      role = 'Admin'
      superAdmin = true
    } else {
      // When selecting any other role, explicitly set superAdmin to false
      superAdmin = false
    }

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
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="w-5 h-5" />
              Gestión de Usuarios ({users.length})
            </CardTitle>
            <Button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Miembro
            </Button>
          </div>
        </CardHeader>
      <CardContent className="space-y-4">
        {users.map((userItem) => (
          <div key={userItem.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {getRoleIcon(userItem.role, userItem.super_admin)}
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">
                  {userItem.nombre} {userItem.apellido1}
                  {userItem.apellido2 && ` ${userItem.apellido2}`}
                </p>
                <p className="text-sm text-slate-600 truncate">{userItem.email}</p>
                <p className="text-xs text-slate-500">
                  Miembro desde {formatDate(userItem.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
              <div className="flex-shrink-0">
                {getRoleBadge(userItem.role, userItem.super_admin)}
              </div>
              
              <Select
                value={userItem.super_admin ? 'Super Admin' : userItem.role}
                onValueChange={(value) => updateUserRole(userItem.id, value)}
                disabled={updatingUser === userItem.id}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Miembro">Miembro</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  {currentUserIsSuperAdmin && (
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    <AddNewMemberModal
      isOpen={isAddMemberModalOpen}
      onClose={() => setIsAddMemberModalOpen(false)}
      onMemberAdded={() => {
        fetchUsers()
        setIsAddMemberModalOpen(false)
      }}
    />
    </>
  )
}
