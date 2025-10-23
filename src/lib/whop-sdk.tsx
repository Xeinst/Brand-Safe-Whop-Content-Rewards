// Real Whop SDK implementation for brand-safe content approval app
import React, { createContext, useContext, useEffect, useState } from 'react'
import { WhopApp, WhopSDK as WhopSDKType } from '@whop-apps/sdk'

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
  user: string
  status: 'pending_approval' | 'approved' | 'rejected' | 'published'
  paid: boolean
  views: number
  likes: number
  submissionDate: Date
  publishedDate: Date | null
  content: {
    title: string
    privateVideoLink: string
    publicVideoLink: string | null
    thumbnail: string
    platform: string
  }
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
  getSubmissions(filters?: { status?: string; user_id?: string }): Promise<Submission[]>
  createSubmission(submission: Partial<Submission>): Promise<Submission>
  approveSubmission(submissionId: string): Promise<void>
  rejectSubmission(submissionId: string, reason: string): Promise<void>
  getMemberStatistics(): Promise<MemberStatistics>
  exportData(options: ExportOptions): Promise<Blob>
  syncWithWhop(): Promise<void>
}

// Real Whop SDK Implementation
export class RealWhopSDK implements WhopSDK {
  public user: WhopUser | null = null
  public company: WhopCompany | null = null
  private whopSDK: WhopSDKType | null = null

  async init(): Promise<void> {
    try {
      // Initialize the real Whop SDK
      this.whopSDK = new WhopSDKType({
        appId: import.meta.env.VITE_WHOP_APP_ID,
        appSecret: import.meta.env.VITE_WHOP_APP_SECRET,
        environment: import.meta.env.VITE_WHOP_APP_ENV || 'development'
      })

      await this.whopSDK.init()
      
      // Get user and company data from the real SDK
      this.user = await this.getUserFromWhop()
      this.company = await this.getCompanyFromWhop()
      
    } catch (error) {
      console.error('Failed to initialize real Whop SDK:', error)
      // Fallback to mock data for development
      await this.initializeMockData()
    }
  }

  isAuthenticated(): boolean {
    return this.whopSDK?.isAuthenticated() || false
  }

  isWhopMember(): boolean {
    return this.whopSDK?.isWhopMember() || false
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

  private async initializeMockData(): Promise<void> {
    // Fallback mock data for development
    this.user = {
      id: 'demo-user-1',
      username: 'demo_user',
      email: 'demo@example.com',
      avatar: 'https://via.placeholder.com/40',
      display_name: 'Demo User',
      role: 'member',
      permissions: ['read_content', 'write_content', 'read_analytics']
    }

    this.company = {
      id: 'demo-company-1',
      name: 'Demo Brand Community',
      description: 'A sample community for testing brand-safe content approval',
      logo: 'https://via.placeholder.com/100'
    }
  }

  async getContentRewards(): Promise<ContentReward[]> {
    try {
      const response = await fetch('/api/content-rewards')
      if (!response.ok) throw new Error('Failed to fetch content rewards')
      return await response.json()
    } catch (error) {
      console.error('Error fetching content rewards:', error)
      return []
    }
  }

  async getSubmissions(filters?: { status?: string; user_id?: string }): Promise<Submission[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.user_id) params.append('user_id', filters.user_id)
      
      const response = await fetch(`/api/submissions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch submissions')
      return await response.json()
    } catch (error) {
      console.error('Error fetching submissions:', error)
      return []
    }
  }

  async createSubmission(submission: Partial<Submission>): Promise<Submission> {
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      })
      if (!response.ok) throw new Error('Failed to create submission')
      return await response.json()
    } catch (error) {
      console.error('Error creating submission:', error)
      throw error
    }
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
}

// Context and Provider
const WhopSDKContext = createContext<WhopSDK | null>(null)

export function WhopSDKProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<WhopSDK | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initSDK = async () => {
      try {
        const realSDK = new RealWhopSDK()
        await realSDK.init()
        setSdk(realSDK)
      } catch (error) {
        console.error('Failed to initialize Whop SDK:', error)
        setError('Failed to initialize Whop SDK')
      } finally {
        setLoading(false)
      }
    }

    initSDK()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Loading Brand Safe Content Rewards...</h1>
          <p className="text-gray-300">Initializing Whop SDK...</p>
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

// Export the WhopApp component from the real SDK
export { WhopApp } from '@whop-apps/sdk'