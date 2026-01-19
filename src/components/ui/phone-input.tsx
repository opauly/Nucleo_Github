"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  placeholder?: string
  className?: string
}

interface CountryCode {
  code: string
  name: string
  dialCode: string
  flag: string
}

const countryCodes: CountryCode[] = [
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮' },
  { code: 'PA', name: 'Panama', dialCode: '+507', flag: '🇵🇦' },
  { code: 'BZ', name: 'Belize', dialCode: '+501', flag: '🇧🇿' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
]

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "8888 8888",
  className = ""
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]) // Costa Rica default

  const handleCountryChange = (countryCode: string) => {
    const country = countryCodes.find(c => c.code === countryCode)
    if (country) {
      setSelectedCountry(country)
      // Update the full phone number with new country code
      const phoneNumber = value.replace(/^\+\d+\s*/, '') // Remove existing country code
      onChange(`${country.dialCode} ${phoneNumber}`)
    }
  }

  const handlePhoneChange = (phoneNumber: string) => {
    // Remove any existing country code and add the selected one
    const cleanNumber = phoneNumber.replace(/^\+\d+\s*/, '')
    onChange(`${selectedCountry.dialCode} ${cleanNumber}`)
  }

  // Extract just the phone number part (without country code) for the input
  const phoneNumberOnly = value.replace(/^\+\d+\s*/, '')

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Country Code Selector */}
      <Select
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-32">
          <SelectValue>
            <span className="flex items-center gap-1">
              <span>{selectedCountry.flag}</span>
              <span className="text-xs">{selectedCountry.dialCode}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span className="text-sm">{country.name}</span>
                <span className="text-xs text-slate-500">{country.dialCode}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Phone Number Input */}
      <Input
        type="tel"
        value={phoneNumberOnly}
        onChange={(e) => handlePhoneChange(e.target.value)}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className="flex-1"
      />
    </div>
  )
}







