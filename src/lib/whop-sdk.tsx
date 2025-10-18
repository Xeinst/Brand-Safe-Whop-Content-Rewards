// Whop SDK implementation for brand-safe content approval app
import React, { createContext, useContext } from 'react'

export interface WhopUser {
  id: string
  username: string
  email?: string
  avatar?: string
  display_name?: string
}

export interface WhopCompany {
  id: string
  name: string
  description?: string
  logo?: string
}

export interface WhopSDK {
  user: WhopUser | null
  company: WhopCompany | null
  init(): Promise<void>
  isAuthenticated(): boolean
}

export class WhopSDKWrapper implements WhopSDK {
  user: WhopUser | null = null
  company: WhopCompany | null = null

  async init(): Promise<void> {
    try {
      // For now, use mock data until Whop SDK is properly configured
      this.user = {
        id: 'mock-user-1',
        username: 'demo_user',
        email: 'demo@example.com',
        avatar: 'https://via.placeholder.com/40',
        display_name: 'Demo User'
      }
      
      this.company = {
        id: 'mock-company-1',
        name: 'Demo Brand Community',
        description: 'A sample community for testing brand-safe content approval'
      }
    } catch (error) {
      console.error('Failed to initialize Whop SDK:', error)
    }
  }

  isAuthenticated(): boolean {
    return true // Mock authentication
  }
}

// Mock SDK for development when official SDK is not available
export class MockWhopSDK implements WhopSDK {
  user: WhopUser | null = null
  company: WhopCompany | null = null

  async init(): Promise<void> {
    // Mock initialization
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Set mock data
    this.user = {
      id: 'mock-user-1',
      username: 'demo_user',
      email: 'demo@example.com',
      avatar: 'https://via.placeholder.com/40',
      display_name: 'Demo User'
    }
    
    this.company = {
      id: 'mock-company-1',
      name: 'Demo Brand Community',
      description: 'A sample community for testing brand-safe content approval'
    }
  }

  isAuthenticated(): boolean {
    return true // Mock authentication
  }
}

// Context for React components

interface WhopContextType {
  sdk: WhopSDK | null
}

export const WhopContext = createContext<WhopContextType>({ sdk: null })

export function useWhopSDK() {
  const context = useContext(WhopContext)
  if (!context.sdk) {
    throw new Error('useWhopSDK must be used within a WhopApp provider')
  }
  return context.sdk
}

// Mock WhopApp component
export function WhopApp({ sdk, children }: { sdk: WhopSDK; children: React.ReactNode }) {
  return (
    <WhopContext.Provider value={{ sdk }}>
      {children}
    </WhopContext.Provider>
  )
}
