// Whop SDK implementation for brand-safe content approval app
import React, { createContext, useContext } from 'react'
import { WhopSDK as OfficialWhopSDK } from '@whop-apps/sdk'

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
  private sdk: OfficialWhopSDK | null = null
  user: WhopUser | null = null
  company: WhopCompany | null = null

  async init(): Promise<void> {
    try {
      // Initialize the official Whop SDK
      this.sdk = new OfficialWhopSDK({
        appId: import.meta.env.VITE_WHOP_APP_ID || 'your_app_id_here',
        appSecret: import.meta.env.VITE_WHOP_APP_SECRET || 'your_app_secret_here',
        environment: import.meta.env.VITE_WHOP_APP_ENV || 'development'
      })

      await this.sdk.init()
      
      // Get user and company data
      const userData = await this.sdk.getUser()
      const companyData = await this.sdk.getCompany()
      
      this.user = userData ? {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        avatar: userData.avatar_url,
        display_name: userData.display_name
      } : null
      
      this.company = companyData ? {
        id: companyData.id,
        name: companyData.name,
        description: companyData.description,
        logo: companyData.logo_url
      } : null
      
    } catch (error) {
      console.error('Failed to initialize Whop SDK:', error)
      // Fallback to mock data for development
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
  }

  isAuthenticated(): boolean {
    return this.sdk?.isAuthenticated() || false
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
