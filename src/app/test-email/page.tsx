"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [emailType, setEmailType] = useState('event-registration')
  const [isLoading, setIsLoading] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const emailTypes = [
    { value: 'event-registration', label: 'Event Registration Confirmation' },
    { value: 'event-approval', label: 'Event Approval Notification' },
    { value: 'event-rejection', label: 'Event Rejection Notification' },
    { value: 'team-membership', label: 'Team Membership Confirmation' },
    { value: 'team-approval', label: 'Team Approval Notification' },
    { value: 'team-rejection', label: 'Team Rejection Notification' }
  ]

  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setIsLoading(true)
    setLastResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          type: emailType
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Test email sent successfully!')
        setLastResult(result)
      } else {
        toast.error(result.error || 'Failed to send test email')
        setLastResult(result)
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80">
          <img
            src="/img/eventos-hero.jpg"
            alt="Test Email System"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Test Email System
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light drop-shadow-md">
              Verify email confirmation functionality
            </p>
          </div>
        </div>
      </section>

      {/* Test Form */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Send Test Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address to test"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="emailType" className="text-sm font-medium text-slate-700">
                    Email Type
                  </label>
                  <Select value={emailType} onValueChange={setEmailType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email type" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSendTestEmail}
                  disabled={isLoading || !email}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>

                {lastResult && (
                  <div className="mt-6 p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      {lastResult.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        {lastResult.success ? 'Success' : 'Error'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {lastResult.message || lastResult.error}
                    </p>
                    {lastResult.result && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                          View Response Details
                        </summary>
                        <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto">
                          {JSON.stringify(lastResult.result, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="mt-8 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">1. Setup Resend API Key</h4>
                  <p>Add your Resend API key to <code className="bg-slate-100 px-1 rounded">.env.local</code>:</p>
                  <code className="block bg-slate-100 p-2 rounded mt-1 text-xs">
                    RESEND_API_KEY=your_resend_api_key_here
                  </code>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">2. Test Email Types</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Event Registration:</strong> Sent when user registers for an event</li>
                    <li><strong>Event Approval/Rejection:</strong> Sent when admin approves/rejects event registration</li>
                    <li><strong>Team Membership:</strong> Sent when user requests to join a team</li>
                    <li><strong>Team Approval/Rejection:</strong> Sent when admin approves/rejects team membership</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-slate-800 mb-2">3. Check Email Delivery</h4>
                  <p>After sending a test email, check your email inbox (and spam folder) to verify the email was received correctly.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}




