import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Get all users with their profiles
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        nombre,
        apellido1,
        apellido2,
        role,
        super_admin,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Error fetching users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: users || []
    })

  } catch (error: unknown) {
    console.error('Error in users fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    const { targetUserId, role, superAdmin } = await request.json()

    if (!targetUserId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: targetUserId and role' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['Miembro', 'Staff', 'Admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be Miembro, Staff, or Admin' },
        { status: 400 }
      )
    }

    // Update user role
    const updateData: any = { 
      role,
      super_admin: superAdmin !== undefined ? superAdmin : false
    }

    console.log('Updating user role:', { targetUserId, role, superAdmin, updateData })

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json(
        { error: 'Error updating user role', details: error.message },
        { status: 500 }
      )
    }

    console.log('User role updated successfully:', updatedUser)

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUser
    })

  } catch (error: unknown) {
    console.error('Error in user role update:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
