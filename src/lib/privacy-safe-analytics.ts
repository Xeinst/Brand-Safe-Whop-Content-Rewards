// Privacy-safe analytics and error tracking
// Works even when external services (Sentry, etc.) are blocked by ad blockers

interface PrivacySafeAnalytics {
  trackEvent: (event: string, data?: any) => void
  trackError: (error: Error, context?: any) => void
  trackPageView: (path: string) => void
  getAnalytics: () => any
  clearAnalytics: () => void
}

class PrivacySafeAnalyticsImpl implements PrivacySafeAnalytics {
  private events: Array<{timestamp: Date, event: string, data?: any}> = []
  private errors: Array<{timestamp: Date, error: Error, context?: any}> = []
  private pageViews: Array<{timestamp: Date, path: string}> = []
  private maxEvents = 100 // Keep only last 100 events to preserve privacy

  trackEvent(event: string, data?: any): void {
    try {
      this.events.push({
        timestamp: new Date(),
        event,
        data: this.sanitizeData(data)
      })
      
      // Keep only recent events
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents)
      }
      
      console.log('📊 [ANALYTICS] Event tracked:', event, data)
    } catch (error) {
      console.warn('⚠️ [ANALYTICS] Failed to track event:', error)
    }
  }

  trackError(error: Error, context?: any): void {
    try {
      this.errors.push({
        timestamp: new Date(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack?.substring(0, 500) // Limit stack trace length
        } as Error,
        context: this.sanitizeData(context)
      })
      
      // Keep only recent errors
      if (this.errors.length > 50) {
        this.errors = this.errors.slice(-50)
      }
      
      console.log('🚨 [ANALYTICS] Error tracked:', error.message)
    } catch (err) {
      console.warn('⚠️ [ANALYTICS] Failed to track error:', err)
    }
  }

  trackPageView(path: string): void {
    try {
      this.pageViews.push({
        timestamp: new Date(),
        path: path.substring(0, 200) // Limit path length
      })
      
      // Keep only recent page views
      if (this.pageViews.length > 50) {
        this.pageViews = this.pageViews.slice(-50)
      }
      
      console.log('📄 [ANALYTICS] Page view tracked:', path)
    } catch (error) {
      console.warn('⚠️ [ANALYTICS] Failed to track page view:', error)
    }
  }

  getAnalytics(): any {
    return {
      events: this.events.slice(-20), // Return only last 20 events
      errors: this.errors.slice(-10), // Return only last 10 errors
      pageViews: this.pageViews.slice(-10), // Return only last 10 page views
      summary: {
        totalEvents: this.events.length,
        totalErrors: this.errors.length,
        totalPageViews: this.pageViews.length,
        lastActivity: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : null
      }
    }
  }

  clearAnalytics(): void {
    this.events = []
    this.errors = []
    this.pageViews = []
    console.log('🗑️ [ANALYTICS] Analytics data cleared')
  }

  private sanitizeData(data: any): any {
    if (!data) return undefined
    
    try {
      // Remove sensitive information
      const sanitized = JSON.parse(JSON.stringify(data))
      
      // Remove common sensitive fields
      const sensitiveFields = ['password', 'token', 'key', 'secret', 'email', 'phone', 'ssn']
      const sanitizeObject = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj
        
        if (Array.isArray(obj)) {
          return obj.map(sanitizeObject)
        }
        
        const result: any = {}
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase()
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            result[key] = '[REDACTED]'
          } else {
            result[key] = sanitizeObject(value)
          }
        }
        return result
      }
      
      return sanitizeObject(sanitized)
    } catch (error) {
      return '[SANITIZATION_ERROR]'
    }
  }
}

// Export singleton instance
export const privacySafeAnalytics = new PrivacySafeAnalyticsImpl()

// Global error tracking that works with ad blockers
window.addEventListener('error', (event) => {
  privacySafeAnalytics.trackError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    type: 'javascript_error'
  })
})

window.addEventListener('unhandledrejection', (event) => {
  privacySafeAnalytics.trackError(new Error(event.reason), {
    type: 'unhandled_promise_rejection'
  })
})

// Track page views
let currentPath = window.location.pathname
privacySafeAnalytics.trackPageView(currentPath)

// Track route changes
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function(...args) {
  originalPushState.apply(history, args)
  const newPath = window.location.pathname
  if (newPath !== currentPath) {
    currentPath = newPath
    privacySafeAnalytics.trackPageView(newPath)
  }
}

history.replaceState = function(...args) {
  originalReplaceState.apply(history, args)
  const newPath = window.location.pathname
  if (newPath !== currentPath) {
    currentPath = newPath
    privacySafeAnalytics.trackPageView(newPath)
  }
}

window.addEventListener('popstate', () => {
  const newPath = window.location.pathname
  if (newPath !== currentPath) {
    currentPath = newPath
    privacySafeAnalytics.trackPageView(newPath)
  }
})

// Export types
export type { PrivacySafeAnalytics }
