"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ImageUpload } from '@/components/ui/image-upload'
import { toast } from 'sonner'

export default function TestContentPage() {
  const [content, setContent] = useState('<p>Test content...</p>')
  const [imageUrl, setImageUrl] = useState('')
  const [schemaInfo, setSchemaInfo] = useState<any>(null)

  const handleImageUploaded = (file: File, tempUrl: string) => {
    setImageUrl(tempUrl)
    // Also add the image to the rich text editor content
    const imageTag = `<img src="${tempUrl}" alt="Uploaded image" style="max-width: 100%; height: auto;" data-temp-file="${file.name}" />`
    setContent(prev => prev + imageTag)
    toast.success('Image added to content (preview)!')
  }

  const checkSchema = async () => {
    try {
      const response = await fetch('/api/admin/check-schema')
      const result = await response.json()
      
      if (response.ok) {
        setSchemaInfo(result)
        toast.success('Schema check completed')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Error checking schema')
    }
  }

  const handleSetupStorage = async () => {
    try {
      const response = await fetch('/api/admin/setup-storage', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (response.ok) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Error setting up storage')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Content Management Test
            </h1>
            <p className="text-slate-600">
              Test the rich text editor and image upload functionality
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Rich Text Editor Test */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Rich Text Editor</h2>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Test the rich text editor..."
                className="min-h-[300px]"
              />
              <div className="p-4 bg-slate-100 rounded-lg">
                <h3 className="font-medium mb-2">Current Content:</h3>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>

            {/* Image Upload Test */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Image Upload</h2>
              <div className="flex gap-2">
                <Button onClick={handleSetupStorage} variant="outline" className="flex-1">
                  Setup Storage Bucket
                </Button>
                <Button onClick={checkSchema} variant="outline" className="flex-1">
                  Check Schema
                </Button>
              </div>
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                folder="test-images"
              />
              {imageUrl && (
                <div className="p-4 bg-slate-100 rounded-lg">
                  <h3 className="font-medium mb-2">Uploaded Image:</h3>
                  <img 
                    src={imageUrl} 
                    alt="Uploaded test image" 
                    className="max-w-full h-auto rounded-lg"
                  />
                  <p className="text-sm text-slate-600 mt-2">{imageUrl}</p>
                </div>
              )}
            </div>
          </div>

          {/* Schema Info */}
          {schemaInfo && (
            <div className="p-4 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Database Schema:</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Announcements:</strong> {schemaInfo.announcements.hasAuthorId ? '✅ Has author_id' : '❌ Missing author_id'}
                  {schemaInfo.sqlCommands.announcements && (
                    <div className="mt-1 p-2 bg-yellow-100 rounded text-xs">
                      <strong>SQL to run:</strong> {schemaInfo.sqlCommands.announcements}
                    </div>
                  )}
                </div>
                <div>
                  <strong>Devotionals:</strong> {schemaInfo.devotionals.hasAuthorId ? '✅ Has author_id' : '❌ Missing author_id'}
                  {schemaInfo.sqlCommands.devotionals && (
                    <div className="mt-1 p-2 bg-yellow-100 rounded text-xs">
                      <strong>SQL to run:</strong> {schemaInfo.sqlCommands.devotionals}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="text-center space-y-4">
            <Button 
              onClick={() => window.location.href = '/admin?tab=content'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Admin Content
            </Button>
            <div className="text-sm text-slate-500">
              <p>Server running on: http://localhost:3001</p>
              <p>Admin panel: http://localhost:3001/admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
