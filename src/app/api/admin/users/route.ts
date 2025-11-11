import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSuperAdmin, isAdmin } from '@/lib/auth/role-auth'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the requesting user's ID from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const userId = authHeader.replace('Bearer ', '')
    
    // Check if user is admin or super admin bypass
    const superAdminBypass = request.headers.get('x-super-admin') === 'true'
    if (!superAdminBypass) {
      const adminStatus = await isAdmin(userId)
      if (!adminStatus) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
    }

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { userId, targetUserId, role, superAdmin } = await request.json()

    if (!userId || !targetUserId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, targetUserId, and role' },
        { status: 400 }
      )
    }

    // Check if requesting user is super admin or super admin bypass
    const superAdminBypass = request.headers.get('x-super-admin') === 'true'
    if (!superAdminBypass) {
      const superAdminStatus = await isSuperAdmin(userId)
      if (!superAdminStatus) {
        return NextResponse.json(
          { error: 'Super admin access required to assign roles' },
          { status: 403 }
        )
      }
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
