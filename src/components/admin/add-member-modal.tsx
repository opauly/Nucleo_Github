"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Search, 
  User, 
  Mail, 
  Plus, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

interface User {
  id: string
  nombre: string
  apellido1: string
  apellido2: string | null
  email: string
  role: string
  created_at: string
}

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  teamId: string
  teamName: string
  onMemberAdded: () => void
}

export function AddMemberModal({ isOpen, onClose, teamId, teamName, onMemberAdded }: AddMemberModalProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [role, setRole] = useState('miembro')
  const [isLeader, setIsLeader] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const searchUsers = async () => {
    setSearching(true)
    try {
      const response = await fetch(`/api/admin/search-users?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        }
      })

      const result = await response.json()

      if (response.ok) {
        setSearchResults(result.users)
      } else {
        toast.error(result.error || 'Error al buscar usuarios')
      }
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Error de conexión')
    } finally {
      setSearching(false)
    }
  }

  const handleAddMember = async () => {
    if (!selectedUser) {
      toast.error('Por favor selecciona un usuario')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/teams/add-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
          'X-Super-Admin': user?.email === 'opaulyc@gmail.com' ? 'true' : 'false'
        },
        body: JSON.stringify({
          team_id: teamId,
          profile_id: selectedUser.id,
          role,
          team_leader: isLeader
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Miembro agregado exitosamente')
        onMemberAdded()
        handleClose()
      } else {
        toast.error(result.error || 'Error al agregar miembro')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedUser(null)
    setRole('miembro')
    setIsLeader(false)
    onClose()
  }

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'Admin':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Admin</Badge>
      case 'Staff':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Staff</Badge>
      case 'Member':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Member</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{userRole}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar Miembro a {teamName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Buscar Usuario</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search Results */}
            {searching && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}

            {searchResults.length > 0 && !searching && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.nombre} {user.apellido1} {user.apellido2 || ''}
                          </p>
                          <p className="text-sm text-slate-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        {selectedUser?.id === user.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
              <div className="text-center py-4 text-slate-600">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p>No se encontraron usuarios con ese criterio de búsqueda</p>
              </div>
            )}
          </div>

          {/* Selected User and Role Configuration */}
          {selectedUser && (
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">Usuario Seleccionado</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {selectedUser.nombre} {selectedUser.apellido1} {selectedUser.apellido2 || ''}
                  </p>
                  <p className="text-sm text-slate-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Rol en el Equipo</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miembro">Miembro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isLeader"
                    checked={isLeader}
                    onCheckedChange={(checked) => setIsLeader(checked as boolean)}
                  />
                  <Label htmlFor="isLeader" className="text-sm">
                    Asignar como líder del equipo
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={!selectedUser || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Miembro
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
