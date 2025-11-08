import { createClient } from './client'

export async function inspectLocationTables() {
  const supabase = createClient()
  if (!supabase) {
    console.error('❌ Supabase client not initialized')
    return
  }

  console.log('🔍 Inspecting location tables...')

  try {
    // Inspect provincias table
    console.log('\n📋 PROVINCIAS TABLE:')
    const { data: provinciasData, error: provinciasError } = await supabase
      .from('provincias')
      .select('*')
      .limit(5)

    if (provinciasError) {
      console.error('❌ Provincias table error:', provinciasError.message)
    } else {
      console.log('✅ Provincias table accessible')
      if (provinciasData && provinciasData.length > 0) {
        console.log('📋 Provincias table columns:', Object.keys(provinciasData[0]))
        console.log('📊 Sample provincias data:', provinciasData)
      } else {
        console.log('📋 Provincias table is empty')
      }
    }

    // Inspect cantones table
    console.log('\n📋 CANTONES TABLE:')
    const { data: cantonesData, error: cantonesError } = await supabase
      .from('cantones')
      .select('*')
      .limit(5)

    if (cantonesError) {
      console.error('❌ Cantones table error:', cantonesError.message)
    } else {
      console.log('✅ Cantones table accessible')
      if (cantonesData && cantonesData.length > 0) {
        console.log('📋 Cantones table columns:', Object.keys(cantonesData[0]))
        console.log('📊 Sample cantones data:', cantonesData)
      } else {
        console.log('📋 Cantones table is empty')
      }
    }

    // Inspect distritos table
    console.log('\n📋 DISTRITOS TABLE:')
    const { data: distritosData, error: distritosError } = await supabase
      .from('distritos')
      .select('*')
      .limit(5)

    if (distritosError) {
      console.error('❌ Distritos table error:', distritosError.message)
    } else {
      console.log('✅ Distritos table accessible')
      if (distritosData && distritosData.length > 0) {
        console.log('📋 Distritos table columns:', Object.keys(distritosData[0]))
        console.log('📊 Sample distritos data:', distritosData)
      } else {
        console.log('📋 Distritos table is empty')
      }
    }

    // Test relationships
    console.log('\n🔗 TESTING RELATIONSHIPS:')
    
    // Get cantones for a specific provincia
    const { data: cantonesForProvincia, error: cantonesForProvinciaError } = await supabase
      .from('cantones')
      .select('*')
      .eq('provincia', 'San José')
      .limit(3)

    if (cantonesForProvinciaError) {
      console.error('❌ Error getting cantones for San José:', cantonesForProvinciaError.message)
    } else {
      console.log('✅ Cantones for San José:', cantonesForProvincia)
    }

    // Get distritos for a specific canton
    const { data: distritosForCanton, error: distritosForCantonError } = await supabase
      .from('distritos')
      .select('*')
      .eq('canton', 'San José')
      .limit(3)

    if (distritosForCantonError) {
      console.error('❌ Error getting distritos for San José canton:', distritosForCantonError.message)
    } else {
      console.log('✅ Distritos for San José canton:', distritosForCanton)
    }

  } catch (error) {
    console.error('❌ Error inspecting location tables:', error)
  }
}




