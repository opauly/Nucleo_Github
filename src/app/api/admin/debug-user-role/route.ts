import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin
    const userId = auth.userId
    
    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Error fetching user profile', details: error },
        { status: 500 }
      )
    }
    const safeProfile = profile as any

    return NextResponse.json({
      success: true,
      user: {
        id: safeProfile.id,
        email: safeProfile.email,
        role: safeProfile.role,
        super_admin: safeProfile.super_admin,
        nombre: safeProfile.nombre,
        apellido1: safeProfile.apellido1
      },
      isAdmin: safeProfile.role === 'Admin' || safeProfile.super_admin === true,
      isSuperAdmin: safeProfile.super_admin === true
    })

  } catch (error: unknown) {
    console.error('Error in debug user role:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}






