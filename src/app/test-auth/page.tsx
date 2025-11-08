"use client"

import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestAuthPage() {
  const { user, session, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900 text-center">
                Test de Autenticación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Estado de Autenticación
                </h3>
                
                {user ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 font-medium">✅ Usuario Autenticado</p>
                    </div>
                    
                    <div className="text-left space-y-2">
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>ID:</strong> {user.id}</p>
                      <p><strong>Email Verificado:</strong> {user.email_confirmed_at ? 'Sí' : 'No'}</p>
                      <p><strong>Creado:</strong> {new Date(user.created_at).toLocaleDateString('es-ES')}</p>
                    </div>

                    <Button onClick={signOut} className="bg-red-600 hover:bg-red-700">
                      Cerrar Sesión
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-700 font-medium">⚠️ No Autenticado</p>
                    </div>
                    
                    <div className="space-x-4">
                      <Button asChild>
                        <a href="/registro">Registrarse</a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="/iniciar-sesion">Iniciar Sesión</a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">
                  Información de Sesión
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <pre className="text-sm text-slate-700 overflow-auto">
                    {JSON.stringify({ user, session }, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}




