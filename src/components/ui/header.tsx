"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Users, Calendar, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { getUserRole } from "@/lib/auth/role-auth"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Quiénes Somos", href: "/quienes-somos" },
    { name: "Anuncios", href: "/anuncios" },
    { name: "Eventos", href: "/eventos" },
    { name: "Devocionales", href: "/devocionales" },
    { name: "Equipos", href: "/equipos" },
    { name: "Contacto", href: "/contacto" },
  ]

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setCheckingAdmin(false)
        return
      }

      try {
        const userRole = await getUserRole(user.id)
        if (userRole) {
          setIsAdmin(userRole.role === 'Admin' || userRole.super_admin === true)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setCheckingAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/logo_black.png"
              alt="Núcleo Logo"
              className="h-8 lg:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

                            {/* Desktop Auth Buttons */}
                  <div className="hidden lg:flex items-center space-x-4">
                    {loading ? (
                      <div className="flex items-center space-x-4">
                        <div className="animate-pulse bg-slate-200 h-8 w-20 rounded"></div>
                        <div className="animate-pulse bg-slate-200 h-8 w-24 rounded"></div>
                      </div>
                    ) : user ? (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/perfil">
                            <User className="w-4 h-4 mr-2" />
                            Perfil
                          </Link>
                        </Button>
                        {!checkingAdmin && isAdmin && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/admin">
                              <Settings className="w-4 h-4 mr-2" />
                              Admin
                            </Link>
                          </Button>
                        )}
                        <Button size="sm" onClick={signOut} className="bg-red-600 hover:bg-red-700">
                          <LogOut className="w-4 h-4 mr-2" />
                          Cerrar Sesión
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/iniciar-sesion">Iniciar Sesión</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href="/registro">Registrarse</Link>
                        </Button>
                      </>
                    )}
                  </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <nav className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-slate-200 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  <div className="animate-pulse bg-slate-200 h-10 w-full rounded"></div>
                  <div className="animate-pulse bg-slate-200 h-10 w-full rounded"></div>
                </div>
              ) : user ? (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/perfil" onClick={() => setIsMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </Link>
                  </Button>
                  {!checkingAdmin && isAdmin && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin
                      </Link>
                    </Button>
                  )}
                  <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/iniciar-sesion" onClick={() => setIsMenuOpen(false)}>
                      Iniciar Sesión
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/registro" onClick={() => setIsMenuOpen(false)}>
                      Registrarse
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
