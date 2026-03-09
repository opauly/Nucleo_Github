import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.ok) return auth.response
    const supabase: any = auth.supabaseAdmin

    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return NextResponse.json(
        { error: 'Error checking storage buckets' },
        { status: 500 }
      )
    }

    const nucleoImagesBucket = buckets.find((bucket: any) => bucket.name === 'nucleo-images')
    
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






