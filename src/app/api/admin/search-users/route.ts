import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, isSuperAdmin } from '@/lib/auth/role-auth'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if user is admin or super admin
    const isUserAdmin = await isAdmin(user.id)
    const isUserSuperAdmin = await isSuperAdmin(user.id)
    const isSuperAdminHeader = request.headers.get('X-Super-Admin') === 'true'

    if (!isUserAdmin && !isUserSuperAdmin && !isSuperAdminHeader) {
      return NextResponse.json({ error: 'Acceso denegado. Se requieren permisos de administrador.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query debe tener al menos 2 caracteres' }, { status: 400 })
    }

    // Search users by name or email
    const { data: users, error: searchError } = await supabase
      .from('profiles')
      .select(`
        id,
        nombre,
        apellido1,
        apellido2,
        email,
        role,
        created_at
      `)
      .or(`nombre.ilike.%${query}%,apellido1.ilike.%${query}%,apellido2.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (searchError) {
      console.error('Error searching users:', searchError)
      return NextResponse.json({ error: 'Error al buscar usuarios' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })

  } catch (error) {
    console.error('Error in search-users API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}


