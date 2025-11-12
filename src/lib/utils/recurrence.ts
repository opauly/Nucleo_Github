/**
 * Utility functions for calculating recurring event occurrences
 */

export type RecurrenceType = 'weekly' | 'biweekly' | 'monthly' | 'annually'
export type RecurrencePattern = 'days' | 'dates'

export interface RecurrenceConfig {
  is_recurring: boolean
  recurrence_type?: RecurrenceType
  recurrence_pattern?: RecurrencePattern
  recurrence_days?: number[] // 0=Sunday, 1=Monday, ..., 6=Saturday
  recurrence_dates?: number[] // 1-31 for monthly, 1-365 for annually
  recurrence_start_date?: string
  recurrence_end_date?: string | null
  start_date: string // Original event start date
}

/**
 * Calculate the next occurrence date for a recurring event
 * @param config Recurrence configuration
 * @param fromDate Date to calculate from (defaults to now)
 * @returns Next occurrence date or null if no more occurrences
 */
export function calculateNextOccurrence(
  config: RecurrenceConfig,
  fromDate: Date = new Date()
): Date | null {
  if (!config.is_recurring || !config.recurrence_type || !config.recurrence_pattern) {
    return null
  }

  const startDate = config.recurrence_start_date 
    ? new Date(config.recurrence_start_date)
    : new Date(config.start_date)

  // Check if recurrence has ended
  if (config.recurrence_end_date) {
    const endDate = new Date(config.recurrence_end_date)
    if (fromDate > endDate) {
      return null
    }
  }

  // If fromDate is before startDate, return startDate
  if (fromDate < startDate) {
    return startDate
  }

  switch (config.recurrence_type) {
    case 'weekly':
      return calculateWeeklyNextOccurrence(config, fromDate, startDate)
    case 'biweekly':
      return calculateBiweeklyNextOccurrence(config, fromDate, startDate)
    case 'monthly':
      return calculateMonthlyNextOccurrence(config, fromDate, startDate)
    case 'annually':
      return calculateAnnuallyNextOccurrence(config, fromDate, startDate)
    default:
      return null
  }
}

/**
 * Calculate next occurrence for weekly recurrence
 */
function calculateWeeklyNextOccurrence(
  config: RecurrenceConfig,
  fromDate: Date,
  startDate: Date
): Date | null {
  if (config.recurrence_pattern === 'days' && config.recurrence_days) {
    // Find next occurrence on specified days of week
    const targetDays = config.recurrence_days.sort()
    const currentDay = fromDate.getDay()
    
    // Check if today is one of the target days and it's after the start time
    const startTime = new Date(startDate)
    startTime.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
    const fromTime = new Date(fromDate)
    fromTime.setHours(fromDate.getHours(), fromDate.getMinutes(), 0, 0)
    
    // Check same day first
    if (targetDays.includes(currentDay) && fromTime >= startTime) {
      const sameDay = new Date(fromDate)
      sameDay.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
      if (sameDay >= fromTime) {
        return sameDay
      }
    }
    
    // Find next occurrence
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(fromDate)
      checkDate.setDate(checkDate.getDate() + i)
      const dayOfWeek = checkDate.getDay()
      
      if (targetDays.includes(dayOfWeek)) {
        const occurrence = new Date(checkDate)
        occurrence.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
        if (occurrence >= fromTime) {
          return occurrence
        }
      }
    }
  }
  
  return null
}

/**
 * Calculate next occurrence for biweekly recurrence
 */
function calculateBiweeklyNextOccurrence(
  config: RecurrenceConfig,
  fromDate: Date,
  startDate: Date
): Date | null {
  if (config.recurrence_pattern === 'days' && config.recurrence_days) {
    const targetDays = config.recurrence_days.sort()
    
    // Calculate weeks since start
    const weeksSinceStart = Math.floor(
      (fromDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
    
    // Check if we're in the correct biweekly cycle
    const isInCycle = weeksSinceStart % 2 === 0
    
    // Find next occurrence
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date(fromDate)
      checkDate.setDate(checkDate.getDate() + i)
      const dayOfWeek = checkDate.getDay()
      const weeksDiff = Math.floor(
        (checkDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      )
      
      if (targetDays.includes(dayOfWeek) && weeksDiff % 2 === 0) {
        const occurrence = new Date(checkDate)
        occurrence.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
        if (occurrence >= fromDate) {
          return occurrence
        }
      }
    }
  }
  
  return null
}

/**
 * Calculate next occurrence for monthly recurrence
 */
function calculateMonthlyNextOccurrence(
  config: RecurrenceConfig,
  fromDate: Date,
  startDate: Date
): Date | null {
  if (config.recurrence_pattern === 'dates' && config.recurrence_dates) {
    const targetDates = config.recurrence_dates.sort((a, b) => a - b)
    const currentDate = fromDate.getDate()
    const currentMonth = fromDate.getMonth()
    const currentYear = fromDate.getFullYear()
    
    // Check current month first
    for (const targetDate of targetDates) {
      if (targetDate >= currentDate) {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
        if (targetDate <= daysInMonth) {
          const occurrence = new Date(currentYear, currentMonth, targetDate)
          occurrence.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
          if (occurrence >= fromDate) {
            return occurrence
          }
        }
      }
    }
    
    // Check next month
    for (const targetDate of targetDates) {
      let nextMonth = currentMonth + 1
      let nextYear = currentYear
      if (nextMonth > 11) {
        nextMonth = 0
        nextYear++
      }
      
      const daysInMonth = new Date(nextYear, nextMonth + 1, 0).getDate()
      if (targetDate <= daysInMonth) {
        const occurrence = new Date(nextYear, nextMonth, targetDate)
        occurrence.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
        return occurrence
      }
    }
  } else if (config.recurrence_pattern === 'days' && config.recurrence_days) {
    // Monthly on specific days of week (e.g., first Sunday of month)
    // This is more complex - we'll use the first occurrence pattern
    const targetDays = config.recurrence_days.sort()
    const startDayOfWeek = startDate.getDay()
    const startDateOfMonth = startDate.getDate()
    
    // Find which occurrence of the day (1st, 2nd, 3rd, 4th, or last)
    const occurrenceNumber = Math.floor((startDateOfMonth - 1) / 7) + 1
    
    // Check current month
    for (const targetDay of targetDays) {
      if (targetDay === startDayOfWeek) {
        const occurrence = findNthDayOfMonth(
          fromDate.getFullYear(),
          fromDate.getMonth(),
          targetDay,
          occurrenceNumber
        )
        if (occurrence && occurrence >= fromDate) {
          occurrence.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
          return occurrence
        }
      }
    }
    
    // Check next month
    let nextMonth = fromDate.getMonth() + 1
    let nextYear = fromDate.getFullYear()
    if (nextMonth > 11) {
      nextMonth = 0
      nextYear++
    }
    
    for (const targetDay of targetDays) {
      if (targetDay === startDayOfWeek) {
        const occurrence = findNthDayOfMonth(
          nextYear,
          nextMonth,
          targetDay,
          occurrenceNumber
        )
        if (occurrence) {
          occurrence.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
          return occurrence
        }
      }
    }
  }
  
  return null
}

/**
 * Calculate next occurrence for annual recurrence
 */
function calculateAnnuallyNextOccurrence(
  config: RecurrenceConfig,
  fromDate: Date,
  startDate: Date
): Date | null {
  if (config.recurrence_pattern === 'dates' && config.recurrence_dates) {
    // Dates represent day of year (1-365/366)
    const targetDaysOfYear = config.recurrence_dates.sort((a, b) => a - b)
    const currentDayOfYear = getDayOfYear(fromDate)
    
    // Check current year
    for (const targetDay of targetDaysOfYear) {
      if (targetDay >= currentDayOfYear) {
        const occurrence = getDateFromDayOfYear(fromDate.getFullYear(), targetDay)
        occurrence.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
        if (occurrence >= fromDate) {
          return occurrence
        }
      }
    }
    
    // Check next year
    for (const targetDay of targetDaysOfYear) {
      const occurrence = getDateFromDayOfYear(fromDate.getFullYear() + 1, targetDay)
      occurrence.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
      return occurrence
    }
  } else if (config.recurrence_pattern === 'days' && config.recurrence_days) {
    // Annual on specific days (e.g., first Sunday of January)
    const targetDays = config.recurrence_days.sort()
    const startMonth = startDate.getMonth()
    const startDayOfWeek = startDate.getDay()
    const startDateOfMonth = startDate.getDate()
    const occurrenceNumber = Math.floor((startDateOfMonth - 1) / 7) + 1
    
    // Check current year
    if (fromDate.getMonth() <= startMonth) {
      for (const targetDay of targetDays) {
        if (targetDay === startDayOfWeek) {
          const occurrence = findNthDayOfMonth(
            fromDate.getFullYear(),
            startMonth,
            targetDay,
            occurrenceNumber
          )
          if (occurrence && occurrence >= fromDate) {
            occurrence.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
            return occurrence
          }
        }
      }
    }
    
    // Check next year
    for (const targetDay of targetDays) {
      if (targetDay === startDayOfWeek) {
        const occurrence = findNthDayOfMonth(
          fromDate.getFullYear() + 1,
          startMonth,
          targetDay,
          occurrenceNumber
        )
        if (occurrence) {
          occurrence.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
          return occurrence
        }
      }
    }
  }
  
  return null
}

/**
 * Helper: Find the nth occurrence of a day of week in a month
 */
function findNthDayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  n: number
): Date | null {
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()
  
  // Find first occurrence of target day
  let daysToAdd = (dayOfWeek - firstDayOfWeek + 7) % 7
  if (daysToAdd === 0 && firstDayOfWeek !== dayOfWeek) {
    daysToAdd = 7
  }
  
  const firstOccurrence = new Date(year, month, 1 + daysToAdd)
  
  // Add weeks for nth occurrence
  const nthOccurrence = new Date(firstOccurrence)
  nthOccurrence.setDate(firstOccurrence.getDate() + (n - 1) * 7)
  
  // Check if still in same month
  if (nthOccurrence.getMonth() === month) {
    return nthOccurrence
  }
  
  // If n is 5, return last occurrence
  if (n === 5) {
    const lastDay = new Date(year, month + 1, 0)
    const lastDayOfWeek = lastDay.getDay()
    const daysToSubtract = (lastDayOfWeek - dayOfWeek + 7) % 7
    const lastOccurrence = new Date(lastDay)
    lastOccurrence.setDate(lastDay.getDate() - daysToSubtract)
    return lastOccurrence
  }
  
  return null
}

/**
 * Helper: Get day of year (1-365/366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Helper: Get date from day of year
 */
function getDateFromDayOfYear(year: number, dayOfYear: number): Date {
  const date = new Date(year, 0, 1)
  date.setDate(dayOfYear)
  return date
}

/**
 * Get a human-readable description of the recurrence pattern
 */
export function getRecurrenceDescription(config: RecurrenceConfig): string {
  if (!config.is_recurring || !config.recurrence_type) {
    return ''
  }

  const typeLabels: Record<RecurrenceType, string> = {
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
    annually: 'Anual'
  }

  let description = typeLabels[config.recurrence_type]

  if (config.recurrence_pattern === 'days' && config.recurrence_days) {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const days = config.recurrence_days.map(d => dayNames[d]).join(', ')
    description += ` (${days})`
  } else if (config.recurrence_pattern === 'dates' && config.recurrence_dates) {
    if (config.recurrence_type === 'monthly') {
      const dates = config.recurrence_dates.map(d => `día ${d}`).join(', ')
      description += ` (${dates})`
    } else if (config.recurrence_type === 'annually') {
      const dates = config.recurrence_dates.map(d => {
        const date = getDateFromDayOfYear(new Date().getFullYear(), d)
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
      }).join(', ')
      description += ` (${dates})`
    }
  }

  return description
}


