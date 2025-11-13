import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'reCAPTCHA token is required' },
        { status: 400 }
      )
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not configured')
      // In development, allow requests to proceed if secret key is not set
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ success: true, score: 0.9 })
      }
      return NextResponse.json(
        { error: 'reCAPTCHA is not configured' },
        { status: 500 }
      )
    }

    // Verify token with Google
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify'
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes'])
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed', details: data['error-codes'] },
        { status: 400 }
      )
    }

    // reCAPTCHA v3 returns a score (0.0 to 1.0)
    // 1.0 is very likely a legitimate interaction
    // 0.0 is very likely a bot
    // Typically, scores above 0.5 are considered legitimate
    const score = data.score || 0
    const threshold = 0.5

    if (score < threshold) {
      console.warn(`reCAPTCHA score too low: ${score}`)
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed - low score', score },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      score,
      action: data.action,
    })

  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return NextResponse.json(
      { error: 'Error verifying reCAPTCHA' },
      { status: 500 }
    )
  }
}

