import { createClient } from './client'

export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    
    if (!supabase) {
      console.error('❌ Supabase client not initialized')
      return false
    }

    console.log('🔗 Testing Supabase connection...')

    // Test 1: Check if we can connect
    const { data: testData, error: testError } = await supabase
      .from('teams')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('❌ Connection test failed:', testError.message)
      return false
    }

    console.log('✅ Supabase connection successful!')
    console.log('📊 Teams table accessible')

    // Test 2: Check location tables
    const { data: provinces, error: provincesError } = await supabase
      .from('provincias')
      .select('*')
      .limit(1)

    if (provincesError) {
      console.error('❌ Provincias table error:', provincesError.message)
    } else {
      console.log('✅ Provincias table accessible')
    }

    const { data: cantones, error: cantonesError } = await supabase
      .from('cantones')
      .select('*')
      .limit(1)

    if (cantonesError) {
      console.error('❌ Cantones table error:', cantonesError.message)
    } else {
      console.log('✅ Cantones table accessible')
    }

    const { data: distritos, error: distritosError } = await supabase
      .from('distritos')
      .select('*')
      .limit(1)

    if (distritosError) {
      console.error('❌ Distritos table error:', distritosError.message)
    } else {
      console.log('✅ Distritos table accessible')
    }

    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}







