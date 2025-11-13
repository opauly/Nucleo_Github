"use client"

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

// Hook to load and use reCAPTCHA
export function useReCaptcha(siteKey: string | undefined) {
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (!siteKey) return

    // Load reCAPTCHA script if not already loaded
    if (!scriptLoaded.current && !window.grecaptcha) {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      script.async = true
      script.defer = true
      script.onload = () => {
        scriptLoaded.current = true
      }
      document.head.appendChild(script)
    } else if (window.grecaptcha) {
      scriptLoaded.current = true
    }
  }, [siteKey])

  const getToken = async (action: string): Promise<string | null> => {
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured')
      return null
    }

    if (!window.grecaptcha) {
      // Wait for grecaptcha to be ready
      return new Promise((resolve) => {
        let attempts = 0
        const maxAttempts = 50 // 5 seconds max wait

        const checkInterval = setInterval(() => {
          attempts++
          if (window.grecaptcha) {
            clearInterval(checkInterval)
            window.grecaptcha.ready(async () => {
              try {
                const token = await window.grecaptcha.execute(siteKey, { action })
                resolve(token)
              } catch (error) {
                console.error('reCAPTCHA execution error:', error)
                resolve(null)
              }
            })
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
            console.error('reCAPTCHA failed to load')
            resolve(null)
          }
        }, 100)
      })
    }

    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(siteKey, { action })
          resolve(token)
        } catch (error) {
          console.error('reCAPTCHA execution error:', error)
          resolve(null)
        }
      })
    })
  }

  return { getToken }
}

