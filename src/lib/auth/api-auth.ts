import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

type RoleProfile = {
  id: string
  role: 'Miembro' | 'Staff' | 'Admin'
  super_admin?: boolean | null
}

type GuardResult =
  | {
      ok: true
      userId: string
      userEmail: string | null
      profile: RoleProfile | null
      supabaseAdmin: any
    }
  | {
      ok: false
      response: NextResponse
    }

const getEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }
  }

  return {
    ok: true as const,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey
  }
}

const getBearerToken = (request: NextRequest) => {
  const authHeader =
    request.headers.get('authorization') || request.headers.get('Authorization')
  if (!authHeader) return null
  const [type, token] = authHeader.split(' ')
  if (type !== 'Bearer' || !token) return null
  return token
}

const getProfile = async (
  supabaseAdmin: any,
  userId: string
) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, role, super_admin')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as RoleProfile
}

export const requireUser = async (request: NextRequest): Promise<GuardResult> => {
  const env = getEnv()
  if (!env.ok) return env

  const token = getBearerToken(request)
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }
  }

  const supabaseAuth = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data: authData, error: authError } = await supabaseAuth.auth.getUser(
    token
  )

  if (authError || !authData?.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }
  }

  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const profile = await getProfile(supabaseAdmin, authData.user.id)

  return {
    ok: true,
    userId: authData.user.id,
    userEmail: authData.user.email ?? null,
    profile,
    supabaseAdmin
  }
}

export const requireAdmin = async (
  request: NextRequest
): Promise<GuardResult> => {
  const auth = await requireUser(request)
  if (!auth.ok) return auth

  const isAdmin = auth.profile?.role === 'Admin' || auth.profile?.super_admin
  if (!isAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
  }

  return auth
}

export const requireSuperAdmin = async (
  request: NextRequest
): Promise<GuardResult> => {
  const auth = await requireUser(request)
  if (!auth.ok) return auth

  const isSuperAdmin = auth.profile?.super_admin === true
  if (!isSuperAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      )
    }
  }

  return auth
}

export const requireStaffOrAdmin = async (
  request: NextRequest
): Promise<GuardResult> => {
  const auth = await requireUser(request)
  if (!auth.ok) return auth

  const isStaffOrAdmin =
    auth.profile?.role === 'Staff' ||
    auth.profile?.role === 'Admin' ||
    auth.profile?.super_admin

  if (!isStaffOrAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Staff access required' },
        { status: 403 }
      )
    }
  }

  return auth
}
