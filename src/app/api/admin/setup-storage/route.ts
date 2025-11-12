import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
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

    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return NextResponse.json(
        { error: 'Error checking storage buckets' },
        { status: 500 }
      )
    }

    const nucleoImagesBucket = buckets.find(bucket => bucket.name === 'nucleo-images')
    
    if (!nucleoImagesBucket) {
      // Create the bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('nucleo-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (createError) {
        console.error('Error creating bucket:', createError)
        return NextResponse.json(
          { error: 'Error creating storage bucket' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Storage bucket created successfully',
        bucket: newBucket
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Storage bucket already exists',
      bucket: nucleoImagesBucket
    })

  } catch (error: unknown) {
    console.error('Error in storage setup:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}





