import { createClient } from '@/lib/supabase/client'

export interface UserRole {
  role: 'Miembro' | 'Staff' | 'Admin'
  super_admin?: boolean
}

export interface TeamRole {
  role: 'miembro' | 'lider'
  team_leader?: boolean
}

// Check if user has admin privileges
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, super_admin')
      .eq('id', userId)
      .single()

    if (error || !profile) return false

    return profile.role === 'Admin' || profile.super_admin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Check if user is super admin
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('super_admin')
      .eq('id', userId)
      .single()

    if (error || !profile) return false

    return profile.super_admin === true
  } catch (error) {
    console.error('Error checking super admin status:', error)
    return false
  }
}

// Check if user is team leader for a specific team
export async function isTeamLeader(userId: string, teamId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: membership, error } = await supabase
      .from('team_members')
      .select('team_leader, role')
      .eq('profile_id', userId)
      .eq('team_id', teamId)
      .eq('status', 'approved')
      .single()

    if (error || !membership) return false

    return membership.team_leader === true || membership.role === 'lider'
  } catch (error) {
    console.error('Error checking team leader status:', error)
    return false
  }
}

// Check if user can manage a specific team (admin or team leader)
export async function canManageTeam(userId: string, teamId: string): Promise<boolean> {
  const adminStatus = await isAdmin(userId)
  if (adminStatus) return true

  return await isTeamLeader(userId, teamId)
}

// Get user's role information
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, super_admin')
      .eq('id', userId)
      .single()

    if (error || !profile) return null

    return {
      role: profile.role as 'Miembro' | 'Staff' | 'Admin',
      super_admin: profile.super_admin
    }
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

// Get user's team role for a specific team
export async function getUserTeamRole(userId: string, teamId: string): Promise<TeamRole | null> {
  try {
    const supabase = createClient()
    const { data: membership, error } = await supabase
      .from('team_members')
      .select('role, team_leader')
      .eq('profile_id', userId)
      .eq('team_id', teamId)
      .eq('status', 'approved')
      .single()

    if (error || !membership) return null

    return {
      role: membership.role as 'miembro' | 'lider',
      team_leader: membership.team_leader
    }
  } catch (error) {
    console.error('Error getting user team role:', error)
    return null
  }
}

// Check if user is Staff or above (Staff, Admin, or Super Admin)
export async function isStaffOrAbove(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, super_admin')
      .eq('id', userId)
      .single()

    if (error || !profile) return false

    return profile.role === 'Staff' || profile.role === 'Admin' || profile.super_admin === true
  } catch (error) {
    console.error('Error checking staff status:', error)
    return false
  }
}




