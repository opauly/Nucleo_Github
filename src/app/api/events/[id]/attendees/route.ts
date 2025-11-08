import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin, isSuperAdmin } from '@/lib/auth/role-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params
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
    const isSuperAdminHeader = request.headers.get('x-super-admin') === 'true'

    // Check if user is admin or super admin
    const isUserAdmin = await isAdmin(userId)
    const isUserSuperAdmin = await isSuperAdmin(userId)

    if (!isUserAdmin && !isUserSuperAdmin && !isSuperAdminHeader) {
      // Check if user is team leader for any of the event's teams
      const { data: eventTeams, error: eventTeamsError } = await supabase
        .from('event_teams')
        .select('team_id')
        .eq('event_id', eventId)

      // If event has no teams, only admins can access
      if (eventTeamsError || !eventTeams || eventTeams.length === 0) {
        return NextResponse.json(
          { error: 'Access denied. You must be an admin or team leader for this event.' },
          { status: 403 }
        )
      }

      // Check if user is leader of any associated team using service role client
      let isAuthorized = false
      for (const eventTeam of eventTeams) {
        const { data: membership, error: membershipError } = await supabase
          .from('team_members')
          .select('team_leader, role')
          .eq('profile_id', userId)
          .eq('team_id', eventTeam.team_id)
          .eq('status', 'approved')
          .single()

        if (!membershipError && membership && (membership.team_leader === true || membership.role === 'lider')) {
          isAuthorized = true
          break
        }
      }

      if (!isAuthorized) {
        return NextResponse.json(
          { error: 'Access denied. You must be an admin or team leader for this event.' },
          { status: 403 }
        )
      }
    }

    // Fetch event attendees - first try without relationship to see if basic query works
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select(`
        id,
        status,
        notes,
        created_at,
        profile_id
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching attendees (basic query):', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      return NextResponse.json(
        { 
          error: 'Error fetching attendees', 
          details: error.message || 'Unknown error',
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      )
    }

    // If we have registrations, fetch profile data separately
    let attendeesWithProfiles = []
    if (registrations && registrations.length > 0) {
      const profileIds = registrations.map((r: any) => r.profile_id).filter(Boolean)
      
      console.log(`Found ${registrations.length} registrations with ${profileIds.length} unique profile IDs`)
      console.log('Profile IDs:', profileIds)
      
      if (profileIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, nombre, apellido1, apellido2, email, phone')
          .in('id', profileIds)

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
          console.error('Error details:', JSON.stringify(profilesError, null, 2))
        } else {
          console.log(`Successfully fetched ${profiles?.length || 0} profiles`)
          if (profiles && profiles.length > 0) {
            console.log('Sample profile:', profiles[0])
          }
        }

        // Combine registrations with profiles
        attendeesWithProfiles = await Promise.all(
          registrations.map(async (reg: any) => {
            let profile = profiles?.find((p: any) => p.id === reg.profile_id) || null
            
            // If profile not found in batch query, try fetching individually
            if (!profile && reg.profile_id) {
              console.warn(`Profile not found in batch for registration ${reg.id} with profile_id ${reg.profile_id}, trying individual fetch`)
              const { data: singleProfile, error: singleError } = await supabase
                .from('profiles')
                .select('id, nombre, apellido1, apellido2, email, phone')
                .eq('id', reg.profile_id)
                .single()
              
              if (singleError) {
                console.error(`Error fetching individual profile ${reg.profile_id}:`, singleError)
              } else if (singleProfile) {
                profile = singleProfile
                console.log(`Successfully fetched individual profile for ${reg.profile_id}`)
              } else {
                console.warn(`Profile ${reg.profile_id} does not exist in database`)
              }
            }
            
            return {
              ...reg,
              profiles: profile
            }
          })
        )
      } else {
        console.warn('No profile IDs found in registrations')
        attendeesWithProfiles = registrations.map((reg: any) => ({
          ...reg,
          profiles: null
        }))
      }
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, start_date, location')
      .eq('id', eventId)
      .single()

    if (eventError) {
      console.error('Error fetching event:', eventError)
    }

    return NextResponse.json({
      success: true,
      event: event || null,
      attendees: attendeesWithProfiles || []
    })

  } catch (error: unknown) {
    console.error('Error in attendees fetch:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
