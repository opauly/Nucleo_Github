import { createClient } from './client'

export async function inspectTableStructure() {
  const supabase = createClient()
  
  if (!supabase) {
    console.error('❌ Supabase client not initialized')
    return
  }

  console.log('🔍 Inspecting table structure...')

  try {
    // Test teams table structure
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(1)

    if (teamsError) {
      console.error('❌ Teams table error:', teamsError.message)
    } else {
      console.log('✅ Teams table accessible')
      if (teamsData && teamsData.length > 0) {
        console.log('📋 Teams table columns:', Object.keys(teamsData[0]))
      } else {
        console.log('📋 Teams table is empty, checking schema...')
      }
    }

    // Test events table structure
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1)

    if (eventsError) {
      console.error('❌ Events table error:', eventsError.message)
    } else {
      console.log('✅ Events table accessible')
      if (eventsData && eventsData.length > 0) {
        console.log('📋 Events table columns:', Object.keys(eventsData[0]))
      } else {
        console.log('📋 Events table is empty, checking schema...')
      }
    }

    // Test announcements table structure
    const { data: announcementsData, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .limit(1)

    if (announcementsError) {
      console.error('❌ Announcements table error:', announcementsError.message)
    } else {
      console.log('✅ Announcements table accessible')
      if (announcementsData && announcementsData.length > 0) {
        console.log('📋 Announcements table columns:', Object.keys(announcementsData[0]))
      } else {
        console.log('📋 Announcements table is empty, checking schema...')
      }
    }

  } catch (error) {
    console.error('❌ Error inspecting tables:', error)
  }
}







