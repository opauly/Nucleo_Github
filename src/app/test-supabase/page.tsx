"use client"

import { useEffect, useState } from 'react'
import { testSupabaseConnection } from '@/lib/supabase/test-connection'
import { seedDatabase } from '@/lib/supabase/seed-data'
import { inspectTableStructure } from '@/lib/supabase/inspect-tables'
import { inspectLocationTables } from '@/lib/supabase/inspect-location-tables'
import { Button } from '@/components/ui/button'

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [seedingStatus, setSeedingStatus] = useState<string>('')
  const [inspectionStatus, setInspectionStatus] = useState<string>('')
  const [cleanupStatus, setCleanupStatus] = useState<string>('')
  const [locationInspectionStatus, setLocationInspectionStatus] = useState<string>('')
  const [locationSeedingStatus, setLocationSeedingStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setIsLoading(true)
    setConnectionStatus('Testing connection...')
    
    const success = await testSupabaseConnection()
    
    if (success) {
      setConnectionStatus('✅ Connection successful!')
    } else {
      setConnectionStatus('❌ Connection failed!')
    }
    
    setIsLoading(false)
  }

  const handleSeedData = async () => {
    setIsLoading(true)
    setSeedingStatus('Seeding database...')
    
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setSeedingStatus('✅ Database seeded successfully!')
      } else {
        setSeedingStatus(`❌ Seeding failed: ${result.error}`)
      }
    } catch (error) {
      setSeedingStatus(`❌ Seeding failed: ${error}`)
    }
    
    setIsLoading(false)
  }

                const handleInspectTables = async () => {
                setIsLoading(true)
                setInspectionStatus('Inspecting table structure...')

                await inspectTableStructure()
                setInspectionStatus('✅ Check browser console for table structure!')

                setIsLoading(false)
              }

              const handleInspectLocationTables = async () => {
                setIsLoading(true)
                setLocationInspectionStatus('Inspecting location tables...')

                await inspectLocationTables()
                setLocationInspectionStatus('✅ Check browser console for location tables!')

                setIsLoading(false)
              }

              const handleSeedLocationData = async () => {
                setIsLoading(true)
                setLocationSeedingStatus('Seeding location data from Excel file...')

                try {
                  const response = await fetch('/api/seed-locations', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    }
                  })

                  const result = await response.json()

                  if (response.ok) {
                    setLocationSeedingStatus(`✅ Location data seeded successfully! ${result.stats.provincias} provincias, ${result.stats.cantones} cantones, ${result.stats.distritos} distritos`)
                  } else {
                    setLocationSeedingStatus(`❌ Seeding failed: ${result.error}`)
                  }
                } catch (error: any) {
                  setLocationSeedingStatus(`❌ Seeding failed: ${error.message}`)
                }

                setIsLoading(false)
              }

  const handleCleanDatabase = async () => {
    setIsLoading(true)
    setCleanupStatus('Cleaning database...')
    
    try {
      const response = await fetch('/api/clean', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setCleanupStatus(`✅ Database cleaned successfully! Tables cleaned: ${result.tablesCleaned.join(', ')}`)
      } else {
        setCleanupStatus(`❌ Cleanup failed: ${result.error}`)
      }
    } catch (error) {
      setCleanupStatus(`❌ Cleanup failed: ${error}`)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            Supabase Connection Test
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Connection Status
              </h2>
              <p className="text-slate-600 mb-4">
                {connectionStatus}
              </p>
              <Button 
                onClick={testConnection}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Test Connection
              </Button>
            </div>

                                    <div>
                          <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            Table Structure Inspection
                          </h2>
                          <p className="text-slate-600 mb-4">
                            Check the actual structure of your database tables.
                          </p>
                          <Button
                            onClick={handleInspectTables}
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Inspect Tables
                          </Button>
                          {inspectionStatus && (
                            <p className="mt-2 text-sm">
                              {inspectionStatus}
                            </p>
                          )}
                        </div>

                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            Location Tables Inspection
                          </h2>
                          <p className="text-slate-600 mb-4">
                            Check the structure and relationships of location tables (provincias, cantones, distritos).
                          </p>
                          <Button
                            onClick={handleInspectLocationTables}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            Inspect Location Tables
                          </Button>
                          {locationInspectionStatus && (
                            <p className="mt-2 text-sm">
                              {locationInspectionStatus}
                            </p>
                          )}
                        </div>

                        <div>
                          <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            Seed Location Data
                          </h2>
                          <p className="text-slate-600 mb-4">
                            Seed location data from the Excel file into the database tables.
                          </p>
                          <Button
                            onClick={handleSeedLocationData}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Seed Location Data
                          </Button>
                          {locationSeedingStatus && (
                            <p className="mt-2 text-sm">
                              {locationSeedingStatus}
                            </p>
                          )}
                        </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Database Cleanup
              </h2>
              <p className="text-slate-600 mb-4">
                ⚠️ This will DELETE ALL DATA from teams, events, announcements, devotionals, and contact_messages tables.
              </p>
              <Button 
                onClick={handleCleanDatabase}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                Clean Database
              </Button>
              {cleanupStatus && (
                <p className="mt-2 text-sm">
                  {cleanupStatus}
                </p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Database Seeding
              </h2>
              <p className="text-slate-600 mb-4">
                This will populate your database with sample teams, events, and announcements.
              </p>
              <Button 
                onClick={handleSeedData}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Seed Database
              </Button>
              {seedingStatus && (
                <p className="mt-2 text-sm">
                  {seedingStatus}
                </p>
              )}
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Next Steps
              </h2>
              <ul className="text-slate-600 space-y-2">
                <li>• Update your .env.local file with Supabase credentials</li>
                <li>• Test the connection</li>
                <li>• Seed the database with sample data</li>
                <li>• Check your Supabase dashboard to verify data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
