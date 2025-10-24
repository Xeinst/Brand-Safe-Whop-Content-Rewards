// Comprehensive error handling and feedback system
export interface ErrorReport {
  id: string
  timestamp: Date
  error: Error
  context: {
    userAgent: string
    url: string
    userId?: string
    companyId?: string
    action: string
    retryCount: number
  }
  resolution?: {
    method: 'fallback' | 'retry' | 'manual'
    success: boolean
    message: string
  }
}

export interface NetworkStatus {
  whopApi: 'available' | 'blocked' | 'error' | 'unknown'
  fallbackMode: boolean
  lastCheck: Date
  retryCount: number
}

class ErrorHandler {
  private errorReports: ErrorReport[] = []
  private networkStatus: NetworkStatus = {
    whopApi: 'unknown',
    fallbackMode: false,
    lastCheck: new Date(),
    retryCount: 0
  }
  private maxRetries = 3
  private retryDelay = 1000 // 1 second

  // Automatic error detection and reporting
  async handleError(error: Error, context: Partial<ErrorReport['context']> = {}): Promise<ErrorReport> {
    const errorReport: ErrorReport = {
      id: this.generateId(),
      timestamp: new Date(),
      error,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        action: 'unknown',
        retryCount: 0,
        ...context
      }
    }

    console.error('🚨 [ERROR HANDLER] Error detected:', error)
    console.error('📊 [ERROR HANDLER] Context:', errorReport.context)

    // Check if it's a network/API error
    if (this.isNetworkError(error)) {
      await this.handleNetworkError(errorReport)
    } else {
      await this.handleGenericError(errorReport)
    }

    this.errorReports.push(errorReport)
    return errorReport
  }

  // Detect network-related errors
  private isNetworkError(error: Error): boolean {
    const networkErrorPatterns = [
      'Failed to fetch',
      'ERR_BLOCKED_BY_CLIENT',
      'ERR_NETWORK_CHANGED',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_CONNECTION_REFUSED',
      'ERR_NAME_NOT_RESOLVED',
      'segapi.whop.com',
      'api.whop.com'
    ]

    return networkErrorPatterns.some(pattern => 
      error.message.includes(pattern) || error.stack?.includes(pattern)
    )
  }

  // Handle network-specific errors with automatic fallback
  private async handleNetworkError(errorReport: ErrorReport): Promise<void> {
    console.log('🌐 [ERROR HANDLER] Network error detected, checking Whop API status...')
    
    // Update network status
    this.networkStatus.whopApi = 'blocked'
    this.networkStatus.fallbackMode = true
    this.networkStatus.lastCheck = new Date()

    // Try to determine the specific issue
    if (errorReport.error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
      console.log('🚫 [ERROR HANDLER] Whop API blocked by client (likely ad blocker)')
      errorReport.resolution = {
        method: 'fallback',
        success: true,
        message: 'Switched to fallback mode due to API blocking'
      }
    } else if (errorReport.error.message.includes('Failed to fetch')) {
      console.log('🔌 [ERROR HANDLER] Network connection issue detected')
      errorReport.resolution = {
        method: 'retry',
        success: false,
        message: 'Network connection failed, will retry'
      }
    }

    // Notify user about fallback mode
    this.notifyUser('Network issues detected. Using offline mode with cached data.')
  }

  // Handle generic errors
  private async handleGenericError(errorReport: ErrorReport): Promise<void> {
    console.log('⚠️ [ERROR HANDLER] Generic error detected')
    errorReport.resolution = {
      method: 'manual',
      success: false,
      message: 'Error requires manual intervention'
    }
  }

  // Test Whop API connectivity
  async testWhopConnectivity(): Promise<boolean> {
    try {
      console.log('🔍 [ERROR HANDLER] Testing Whop API connectivity...')
      
      // Test with a simple request to avoid CORS issues
      const testUrl = 'https://api.whop.com/api/v2/health'
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors' // Avoid CORS issues
      })

      clearTimeout(timeoutId)
      
      this.networkStatus.whopApi = 'available'
      this.networkStatus.fallbackMode = false
      this.networkStatus.retryCount = 0
      
      console.log('✅ [ERROR HANDLER] Whop API is accessible')
      return true
    } catch (error) {
      console.log('❌ [ERROR HANDLER] Whop API test failed:', error)
      this.networkStatus.whopApi = 'blocked'
      this.networkStatus.fallbackMode = true
      this.networkStatus.retryCount++
      
      return false
    }
  }

  // Automatic retry mechanism with exponential backoff
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    baseDelay: number = this.retryDelay
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [ERROR HANDLER] Retry attempt ${attempt + 1}/${maxRetries + 1}`)
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.log(`❌ [ERROR HANDLER] Attempt ${attempt + 1} failed:`, error)

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt) // Exponential backoff
          console.log(`⏳ [ERROR HANDLER] Waiting ${delay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError!
  }

  // Get current network status
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus }
  }

  // Get error reports for debugging
  getErrorReports(): ErrorReport[] {
    return [...this.errorReports]
  }

  // Clear old error reports
  clearOldReports(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 hours
    const cutoff = new Date(Date.now() - maxAge)
    this.errorReports = this.errorReports.filter(report => report.timestamp > cutoff)
  }

  // Notify user about status changes
  private notifyUser(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    // Create a non-intrusive notification
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-black' :
      'bg-blue-500 text-white'
    }`
    notification.textContent = message
    
    document.body.appendChild(notification)
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)
  }

  // Generate unique ID for error reports
  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Automatic health check
  async performHealthCheck(): Promise<{
    whopApi: boolean
    fallbackMode: boolean
    errorCount: number
    lastError?: Date
  }> {
    const whopApiAvailable = await this.testWhopConnectivity()
    const lastError = this.errorReports.length > 0 
      ? this.errorReports[this.errorReports.length - 1].timestamp 
      : undefined

    return {
      whopApi: whopApiAvailable,
      fallbackMode: this.networkStatus.fallbackMode,
      errorCount: this.errorReports.length,
      lastError
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error, {
    action: 'unhandled_error',
    url: window.location.href
  })
})

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(new Error(event.reason), {
    action: 'unhandled_promise_rejection',
    url: window.location.href
  })
})

// Export types and utilities
export { ErrorHandler }
export type { ErrorReport, NetworkStatus }
