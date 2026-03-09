import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

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





