// Real Whop SDK implementation for brand-safe content approval app
import React, { createContext, useContext, useEffect, useState } from 'react'

export interface WhopUser {
  id: string
  username: string
  email?: string
  avatar?: string
  display_name?: string
  role: 'member' | 'owner' | 'admin'
  permissions: string[]
}

export interface WhopCompany {
  id: string
  name: string
  description?: string
  logo?: string
}

export interface MemberStatistics {
  totalMembers: number
  activeMembers: number
  newMembers: number
  memberEngagement: number
  topContributors: Array<{
    id: string
    username: string
    submissions: number
    approvedContent: number
    totalEarnings: number
    engagementScore: number
  }>
  contentStats: {
    totalSubmissions: number
    approvedContent: number
    rejectedContent: number
    pendingReview: number
  }
  rewardStats: {
    totalRewardsGiven: number
    averageReward: number
    topEarners: Array<{
      id: string
      username: string
      totalEarnings: number
    }>
  }
}

export interface ExportOptions {
  format: 'csv' | 'excel'
  dateRange: {
    start: Date
    end: Date
  }
  includeMetrics: string[]
}

export interface ContentReward {
  id: string
  name: string
  description: string
  cpm: number
  status: 'active' | 'paused' | 'completed'
  totalViews: number
  totalPaid: number
  approvedSubmissions: number
  totalSubmissions: number
  effectiveCPM: number
}

export interface Submission {
  id: string
  creator_id: string
  username?: string
  display_name?: string
  campaign_id?: string
  campaign_name?: string
  title: string
  description?: string
  private_video_link: string
  public_video_link?: string
  thumbnail_url?: string
  platform: string
  status: 'pending_review' | 'approved' | 'rejected' | 'flagged' | 'published'
  visibility: 'private' | 'public'
  paid: boolean
  views: number
  likes: number
  submission_date: Date
  published_date?: Date
  approved_at?: Date
  rejected_at?: Date
  review_note?: string
}

export interface WhopSDK {
  user: WhopUser | null
  company: WhopCompany | null
  init(): Promise<void>
  isAuthenticated(): boolean
  isWhopMember(): boolean
  getUserRole(): 'member' | 'owner' | 'admin' | null
  isOwner(): boolean
  isMember(): boolean
  hasPermission(permission: string): boolean
  getContentRewards(): Promise<ContentReward[]>
  getSubmissions(filters?: { status?: string; creator_id?: string; public_only?: boolean }): Promise<Submission[]>
  createSubmission(submission: Partial<Submission>): Promise<Submission>
  approveSubmission(submissionId: string): Promise<void>
  rejectSubmission(submissionId: string, reason: string): Promise<void>
  getMemberStatistics(): Promise<MemberStatistics>
  exportData(options: ExportOptions): Promise<Blob>
  syncWithWhop(): Promise<void>
  exportMemberStats(options: ExportOptions): Promise<Blob>
  createContentReward(reward: Partial<ContentReward>): Promise<ContentReward>
  updateContentReward(id: string, updates: Partial<ContentReward>): Promise<ContentReward>
}

// Real Whop SDK Implementation
export class RealWhopSDK implements WhopSDK {
  public user: WhopUser | null = null
  public company: WhopCompany | null = null
  private whopSDK: any = null

  async init(): Promise<void> {
    try {
      console.log('Initializing Whop SDK...')
      console.log('Environment:', process.env.NODE_ENV)
      console.log('Window parent:', window.parent !== window)
      console.log('Location:', window.location.href)
      
      // Check if we're in a Whop iframe environment
      const isWhopEnvironment = window.parent !== window || 
                                window.location.hostname.includes('whop.com') ||
                                window.location.hostname.includes('vercel.app')
      
      console.log('Whop environment detected:', isWhopEnvironment)
      
      if (isWhopEnvironment) {
        // In production Whop environment, try to get real user data
        try {
          // Try to access Whop SDK if available
          if ((window as any).whop) {
            console.log('Whop SDK found in window object')
            this.whopSDK = (window as any).whop
            
            // Initialize Whop SDK
            await this.whopSDK.init()
            
            // Get user data from Whop SDK
            const userData = await this.getUserFromWhop()
            if (userData) {
              this.user = userData
            }
            
            // Get company data from Whop SDK
            const companyData = await this.getCompanyFromWhop()
            if (companyData) {
              this.company = companyData
            }
          }
        } catch (error) {
          console.log('Could not access Whop SDK, using fallback')
        }
      }
      
      // If no user data from Whop, use fallback
      if (!this.user) {
        console.log('Using fallback user data')
        this.user = {
          id: 'demo-user-1',
          username: 'demo_user',
          email: 'demo@example.com',
          avatar: 'https://via.placeholder.com/40',
          display_name: 'Demo User',
          role: 'member',
          permissions: ['read_content', 'write_content', 'read_analytics']
        }
      }

      // If no company data from Whop, use fallback
      if (!this.company) {
      this.company = {
          id: 'demo-company-1',
          name: 'Demo Brand Community',
          description: 'A sample community for testing brand-safe content approval',
          logo: 'https://via.placeholder.com/100'
        }
      }

      console.log('Whop SDK initialized successfully')
      console.log('User:', this.user)
      console.log('Company:', this.company)
    } catch (error) {
      console.error('Failed to initialize Whop SDK:', error)
      throw error
    }
  }

  isAuthenticated(): boolean {
    return this.whopSDK?.isAuthenticated() || !!this.user
  }

  isWhopMember(): boolean {
    return this.whopSDK?.isWhopMember() || this.user?.role === 'member'
  }

  getUserRole(): 'member' | 'owner' | 'admin' | null {
    return this.user?.role || null
  }

  isOwner(): boolean {
    return this.user?.role === 'owner' || this.user?.role === 'admin'
  }

  isMember(): boolean {
    return this.user?.role === 'member'
  }

  hasPermission(permission: string): boolean {
    return this.user?.permissions?.includes(permission) || false
  }

  private async getUserFromWhop(): Promise<WhopUser | null> {
    if (!this.whopSDK) return null
    
    try {
      const whopUser = await this.whopSDK.getUser()
    return {
        id: whopUser.id,
        username: whopUser.username,
        email: whopUser.email,
        avatar: whopUser.avatar,
        display_name: whopUser.display_name,
        role: whopUser.role as 'member' | 'owner' | 'admin',
        permissions: whopUser.permissions || []
      }
    } catch (error) {
      console.error('Error fetching user from Whop:', error)
      return null
    }
  }

  private async getCompanyFromWhop(): Promise<WhopCompany | null> {
    if (!this.whopSDK) return null
    
    try {
      const whopCompany = await this.whopSDK.getCompany()
      return {
        id: whopCompany.id,
        name: whopCompany.name,
        description: whopCompany.description,
        logo: whopCompany.logo
      }
    } catch (error) {
      console.error('Error fetching company from Whop:', error)
      return null
    }
  }


  async getContentRewards(): Promise<ContentReward[]> {
    const response = await fetch('/api/content-rewards')
    if (!response.ok) throw new Error('Failed to fetch content rewards')
    return await response.json()
  }

  async getSubmissions(filters?: { status?: string; creator_id?: string; public_only?: boolean }): Promise<Submission[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.creator_id) params.append('creator_id', filters.creator_id)
    if (filters?.public_only) params.append('public_only', 'true')
    
    const response = await fetch(`/api/submissions?${params}`)
    if (!response.ok) throw new Error('Failed to fetch submissions')
    return await response.json()
  }

  async createSubmission(submissionData: any): Promise<Submission> {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    })
    if (!response.ok) throw new Error('Failed to create submission')
    return await response.json()
  }

  async approveSubmission(submissionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/submissions?id=${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', approved_by: this.user?.id })
      })
      if (!response.ok) throw new Error('Failed to approve submission')
    } catch (error) {
      console.error('Error approving submission:', error)
      throw error
    }
  }

  async rejectSubmission(submissionId: string, reason: string): Promise<void> {
    try {
      const response = await fetch(`/api/submissions?id=${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason, approved_by: this.user?.id })
      })
      if (!response.ok) throw new Error('Failed to reject submission')
    } catch (error) {
      console.error('Error rejecting submission:', error)
      throw error
    }
  }

  async getMemberStatistics(): Promise<MemberStatistics> {
    try {
      const response = await fetch('/api/analytics')
      if (!response.ok) throw new Error('Failed to fetch member statistics')
      return await response.json()
    } catch (error) {
      console.error('Error fetching member statistics:', error)
        return {
        totalMembers: 0,
        activeMembers: 0,
        newMembers: 0,
        memberEngagement: 0,
        topContributors: [],
        contentStats: {
          totalSubmissions: 0,
          approvedContent: 0,
          rejectedContent: 0,
          pendingReview: 0
        },
        rewardStats: {
          totalRewardsGiven: 0,
          averageReward: 0,
          topEarners: []
        }
      }
    }
  }

  async exportData(options: ExportOptions): Promise<Blob> {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      })
      if (!response.ok) throw new Error('Failed to export data')
      return await response.blob()
      } catch (error) {
      console.error('Error exporting data:', error)
      throw error
      }
  }

  async syncWithWhop(): Promise<void> {
    try {
      // Sync user and company data with Whop
      this.user = await this.getUserFromWhop()
      this.company = await this.getCompanyFromWhop()
    } catch (error) {
      console.error('Error syncing with Whop:', error)
      throw error
    }
  }

  async exportMemberStats(options: ExportOptions): Promise<Blob> {
    return this.exportData(options)
  }

  async createContentReward(reward: Partial<ContentReward>): Promise<ContentReward> {
    try {
      const response = await fetch('/api/content-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reward)
      })
      if (!response.ok) throw new Error('Failed to create content reward')
      return await response.json()
    } catch (error) {
      console.error('Error creating content reward:', error)
      throw error
    }
  }

  async updateContentReward(id: string, updates: Partial<ContentReward>): Promise<ContentReward> {
    try {
      const response = await fetch(`/api/content-rewards?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update content reward')
      return await response.json()
    } catch (error) {
      console.error('Error updating content reward:', error)
      throw error
    }
  }
}

// Context and Provider
const WhopSDKContext = createContext<WhopSDK | null>(null)

export function WhopSDKProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<WhopSDK | null>(null)
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [forceLoad, setForceLoad] = useState(false)

  useEffect(() => {
    let isMounted = true

    const initSDK = async () => {
      try {
        // Check if we're in Whop environment
        const isWhopEnvironment = window.parent !== window || window.location.hostname.includes('whop.com')
        console.log('Whop environment detected:', isWhopEnvironment)
        
        const realSDK = new RealWhopSDK()
        await realSDK.init()
        if (isMounted) {
          setSdk(realSDK)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to initialize Whop SDK:', error)
        if (isMounted) {
          setSdk(null)
          setLoading(false)
        }
      }
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.log('SDK initialization timeout')
        if (isMounted) {
          setSdk(null)
          setLoading(false)
        }
      }
    }, 3000) // Reduced timeout to 3 seconds

    // Force load after 5 seconds if still loading (reduced for production)
    const forceTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log('Force loading app without SDK')
        if (isMounted) {
          setSdk(null)
          setLoading(false)
          setForceLoad(true)
        }
      }
    }, 5000) // Reduced to 5 seconds for production

    initSDK()

    return () => {
      isMounted = false
      clearTimeout(timeout)
      clearTimeout(forceTimeout)
    }
  }, []) // Remove loading dependency to prevent infinite loop

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Loading Brand Safe Content Rewards...</h1>
          <p className="text-gray-300">Initializing Whop SDK...</p>
          {forceLoad && (
            <p className="text-yellow-400 text-sm mt-2">Using fallback mode</p>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <h1 className="text-2xl font-bold mb-4 text-whop-dragon-fire">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <WhopSDKContext.Provider value={sdk}>
      {children}
    </WhopSDKContext.Provider>
  )
}

export function useWhopSDK(): WhopSDK {
  const sdk = useContext(WhopSDKContext)
  if (!sdk) {
    throw new Error('useWhopSDK must be used within a WhopSDKProvider')
  }
  return sdk
}

// WhopApp component for Whop integration
export function WhopApp({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}