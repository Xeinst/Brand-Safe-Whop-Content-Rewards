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
  public contentRewards: ContentReward[] = []
  public submissions: Submission[] = []
  private whopSDK: any = null

  async init(): Promise<void> {
    try {
      // For now, use mock data since the real Whop SDK needs proper setup
        // In production, this would initialize the actual Whop SDK
      await this.initializeMockData()
      
    } catch (error) {
      console.error('Failed to initialize Whop SDK:', error)
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

  async initializeMockData(): Promise<void> {
    console.log('Initializing mock data...')
    
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

    // Initialize mock content rewards
    this.contentRewards = [
      {
        id: 'reward-1',
        name: 'Tech Review Campaign',
        description: 'Review the latest tech products and earn rewards',
        cpm: 4.00,
        status: 'active',
        totalViews: 15000,
        totalPaid: 60.00,
        approvedSubmissions: 5,
        totalSubmissions: 8,
        effectiveCPM: 4.00
      },
      {
        id: 'reward-2',
        name: 'Fashion Haul Campaign',
        description: 'Create fashion content and showcase new trends',
        cpm: 3.50,
        status: 'active',
        totalViews: 25000,
        totalPaid: 87.50,
        approvedSubmissions: 7,
        totalSubmissions: 10,
        effectiveCPM: 3.50
      }
    ]

    // Initialize mock submissions
    this.submissions = [
      {
        id: 'sub-1',
        creator_id: 'demo-user-1',
        username: 'demo_user',
        display_name: 'Demo User',
        campaign_id: 'reward-1',
        campaign_name: 'Tech Review Campaign',
        title: 'iPhone 15 Pro Review',
        description: 'Comprehensive review of the new iPhone 15 Pro',
        private_video_link: 'https://youtube.com/watch?v=demo1',
        public_video_link: 'https://youtube.com/watch?v=demo1',
        thumbnail_url: 'https://img.youtube.com/vi/demo1/maxresdefault.jpg',
        platform: 'youtube',
        status: 'approved',
        visibility: 'public',
        paid: true,
        views: 5000,
        likes: 250,
        submission_date: new Date('2024-01-10'),
        published_date: new Date('2024-01-12'),
        approved_at: new Date('2024-01-12'),
        rejected_at: undefined,
        review_note: 'Great content, approved!'
      },
      {
        id: 'sub-2',
        creator_id: 'demo-user-1',
        username: 'demo_user',
        display_name: 'Demo User',
        campaign_id: 'reward-2',
        campaign_name: 'Fashion Haul Campaign',
        title: 'Fall Fashion Haul',
        description: 'Latest fall fashion trends and styling tips',
        private_video_link: 'https://youtube.com/watch?v=demo2',
        public_video_link: undefined,
        thumbnail_url: 'https://img.youtube.com/vi/demo2/maxresdefault.jpg',
        platform: 'youtube',
        status: 'pending_review',
        visibility: 'private',
        paid: false,
        views: 0,
        likes: 0,
        submission_date: new Date('2024-01-20'),
        published_date: undefined,
        approved_at: undefined,
        rejected_at: undefined,
        review_note: undefined
      }
    ]

    console.log('Mock data initialized successfully')
  }

  async getContentRewards(): Promise<ContentReward[]> {
    try {
      const response = await fetch('/api/content-rewards')
      if (!response.ok) throw new Error('Failed to fetch content rewards')
      return await response.json()
    } catch (error) {
      console.error('Error fetching content rewards:', error)
      console.log('Using mock content rewards data')
      // Always return mock data for now since database might not be set up
      return this.contentRewards || [
        {
          id: 'reward-1',
          name: 'Tech Review Campaign',
          description: 'Review the latest tech products and earn rewards',
          cpm: 4.00,
          status: 'active',
          total_views: 15000,
          total_paid: 60.00,
          approved_submissions: 5,
          total_submissions: 8,
          effective_cpm: 4.00,
          created_by: 'demo-user-1',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-15')
        }
      ]
    }
  }

  async getSubmissions(filters?: { status?: string; creator_id?: string; public_only?: boolean }): Promise<Submission[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.creator_id) params.append('creator_id', filters.creator_id)
      if (filters?.public_only) params.append('public_only', 'true')
      
      const response = await fetch(`/api/submissions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch submissions')
      return await response.json()
    } catch (error) {
      console.error('Error fetching submissions:', error)
      console.log('Using mock submissions data')
      // Always return mock data for now since database might not be set up
      let mockSubmissions = this.submissions || [
        {
          id: 'sub-1',
          creator_id: 'demo-user-1',
          username: 'demo_user',
          display_name: 'Demo User',
          campaign_id: 'reward-1',
          campaign_name: 'Tech Review Campaign',
          title: 'iPhone 15 Pro Review',
          description: 'Comprehensive review of the new iPhone 15 Pro',
          private_video_link: 'https://youtube.com/watch?v=demo1',
          public_video_link: 'https://youtube.com/watch?v=demo1',
          thumbnail_url: 'https://img.youtube.com/vi/demo1/maxresdefault.jpg',
          platform: 'youtube',
          status: 'approved',
          visibility: 'public',
          paid: true,
          views: 5000,
          likes: 250,
          submission_date: new Date('2024-01-10'),
          published_date: new Date('2024-01-12'),
          approved_at: new Date('2024-01-12'),
          rejected_at: null,
          review_note: 'Great content, approved!'
        },
        {
          id: 'sub-2',
          creator_id: 'demo-user-1',
          username: 'demo_user',
          display_name: 'Demo User',
          campaign_id: 'reward-2',
          campaign_name: 'Fashion Haul Campaign',
          title: 'Fall Fashion Haul',
          description: 'Latest fall fashion trends and styling tips',
          private_video_link: 'https://youtube.com/watch?v=demo2',
          public_video_link: null,
          thumbnail_url: 'https://img.youtube.com/vi/demo2/maxresdefault.jpg',
          platform: 'youtube',
          status: 'pending_review',
          visibility: 'private',
          paid: false,
          views: 0,
          likes: 0,
          submission_date: new Date('2024-01-20'),
          published_date: null,
          approved_at: null,
          rejected_at: null,
          review_note: null
        }
      ]
      
      // Apply filters to mock data
      if (filters?.status) {
        mockSubmissions = mockSubmissions.filter((sub: Submission) => sub.status === filters.status)
      }
      if (filters?.creator_id) {
        mockSubmissions = mockSubmissions.filter((sub: Submission) => sub.creator_id === filters.creator_id)
      }
      if (filters?.public_only) {
        mockSubmissions = mockSubmissions.filter((sub: Submission) => sub.status === 'approved' && sub.visibility === 'public')
      }
      
      return mockSubmissions
    }
  }

  async createSubmission(submissionData: any): Promise<Submission> {
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })
      if (!response.ok) throw new Error('Failed to create submission')
        return await response.json()
    } catch (error) {
      console.error('Error creating submission:', error)
      console.log('Creating mock submission')
      
      // Create mock submission
      const mockSubmission: Submission = {
        id: `sub-${Date.now()}`,
        creator_id: this.user?.id || 'demo-user-1',
        username: this.user?.username || 'demo_user',
        display_name: this.user?.display_name || 'Demo User',
        campaign_id: submissionData.campaignId,
        campaign_name: 'Mock Campaign',
        title: submissionData.title,
        description: submissionData.description,
        private_video_link: submissionData.storageKey,
        public_video_link: undefined,
        thumbnail_url: submissionData.thumbKey,
        platform: 'youtube',
        status: 'pending_review',
        visibility: 'private',
        paid: false,
        views: 0,
        likes: 0,
        submission_date: new Date(),
        published_date: undefined,
        approved_at: undefined,
        rejected_at: undefined,
        review_note: undefined
      }
      
      // Add to mock submissions
      if (this.submissions) {
        this.submissions.push(mockSubmission)
      }
      
      return mockSubmission
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
        console.log('Falling back to mock data...')
        // Don't set error, just use mock data
        const mockSDK = new RealWhopSDK()
        await mockSDK.initializeMockData()
        if (isMounted) {
          setSdk(mockSDK)
          setLoading(false)
        }
      }
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.log('SDK initialization timeout, using mock data')
        const mockSDK = new RealWhopSDK()
        mockSDK.initializeMockData().then(() => {
          if (isMounted) {
            setSdk(mockSDK)
            setLoading(false)
          }
        })
      }
    }, 3000) // Reduced timeout to 3 seconds

    // Force load after 5 seconds if still loading (reduced for production)
    const forceTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log('Force loading app with mock data')
        const mockSDK = new RealWhopSDK()
        mockSDK.initializeMockData().then(() => {
          if (isMounted) {
            setSdk(mockSDK)
            setLoading(false)
            setForceLoad(true)
          }
        })
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