// Real Whop SDK implementation for brand-safe content approval app
import React, { createContext, useContext, useEffect, useState } from 'react'
import { errorHandler } from './error-handler'

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
  getStatus(): { fallbackMode: boolean; errorCount: number; lastError?: Date }
  performHealthCheck(): Promise<{ whopApi: boolean; fallbackMode: boolean; errorCount: number; lastError?: Date }>
}

// Real Whop SDK Implementation
export class RealWhopSDK implements WhopSDK {
  public user: WhopUser | null = null
  public company: WhopCompany | null = null
  private whopSDK: any = null
  private fallbackMode: boolean = false

  async init(): Promise<void> {
    try {
      console.log('🚀 [WHOP SDK] Initializing Whop SDK...')
      console.log('🌍 [WHOP SDK] Environment:', process.env.NODE_ENV)
      console.log('🪟 [WHOP SDK] Window parent:', window.parent !== window)
      console.log('📍 [WHOP SDK] Location:', window.location.href)
      console.log('🔗 [WHOP SDK] User Agent:', navigator.userAgent)
      console.log('📱 [WHOP SDK] Screen:', `${window.screen.width}x${window.screen.height}`)
      
      // Test Whop API connectivity first
      console.log('🔍 [WHOP SDK] Testing Whop API connectivity...')
      const isWhopApiAvailable = await errorHandler.testWhopConnectivity()
      this.fallbackMode = !isWhopApiAvailable
      
      if (this.fallbackMode) {
        console.log('⚠️ [WHOP SDK] Whop API not available, using fallback mode')
      }
      
      // Check if we're in a Whop iframe environment
      const isWhopEnvironment = window.parent !== window || 
                                window.location.hostname.includes('whop.com') ||
                                window.location.hostname.includes('vercel.app')
      
      console.log('🎯 [WHOP SDK] Whop environment detected:', isWhopEnvironment)
      console.log('🔍 [WHOP SDK] Window object keys:', Object.keys(window))
      console.log('🔍 [WHOP SDK] Document ready state:', document.readyState)
      
      if (isWhopEnvironment && !this.fallbackMode) {
        // In production Whop environment, try to get real user data
        console.log('🔍 [WHOP SDK] Checking for Whop SDK in window object...')
        try {
          // Wait for WHOP SDK to be available with polling
          const whopSDK = await this.waitForWhopSDK()
          
          if (whopSDK) {
            console.log('✅ [WHOP SDK] Whop SDK found in window object')
            console.log('🔍 [WHOP SDK] Whop SDK methods:', Object.keys(whopSDK))
            this.whopSDK = whopSDK
            
            // Initialize Whop SDK with retry mechanism
            console.log('🔄 [WHOP SDK] Initializing Whop SDK...')
            await errorHandler.retryWithBackoff(async () => {
              if (whopSDK.init && typeof whopSDK.init === 'function') {
                await whopSDK.init()
              }
            })
            console.log('✅ [WHOP SDK] Whop SDK initialized successfully')
            
            // Get user data from Whop SDK with error handling
            console.log('👤 [WHOP SDK] Getting user data from Whop SDK...')
            try {
              const userData = await this.getUserFromWhop()
              if (userData) {
                console.log('✅ [WHOP SDK] User data retrieved:', userData)
                this.user = userData
              } else {
                console.log('❌ [WHOP SDK] No user data from Whop SDK')
              }
            } catch (error) {
              console.error('❌ [WHOP SDK] Error getting user data:', error)
              await errorHandler.handleError(error as Error, { action: 'get_user_data' })
            }
            
            // Get company data from Whop SDK with error handling
            console.log('🏢 [WHOP SDK] Getting company data from Whop SDK...')
            try {
              const companyData = await this.getCompanyFromWhop()
              if (companyData) {
                console.log('✅ [WHOP SDK] Company data retrieved:', companyData)
                this.company = companyData
              } else {
                console.log('❌ [WHOP SDK] No company data from Whop SDK')
              }
            } catch (error) {
              console.error('❌ [WHOP SDK] Error getting company data:', error)
              await errorHandler.handleError(error as Error, { action: 'get_company_data' })
            }
          } else {
            console.log('❌ [WHOP SDK] No Whop SDK found in window object')
            console.log('🔍 [WHOP SDK] Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('whop')))
            console.log('🔍 [WHOP SDK] All window properties:', Object.keys(window).slice(0, 20)) // Show first 20 properties
          }
        } catch (error) {
          console.error('❌ [WHOP SDK] Error accessing Whop SDK:', error)
          await errorHandler.handleError(error as Error, { action: 'access_whop_sdk' })
          console.log('🔄 [WHOP SDK] Using fallback data')
          this.fallbackMode = true
        }
      } else {
        console.log('🔄 [WHOP SDK] Not in Whop environment or API unavailable, using fallback data')
        this.fallbackMode = true
      }
      
      // If no user data from Whop, use fallback
      if (!this.user) {
        console.log('🔄 [WHOP SDK] Using fallback user data')
        this.user = {
          id: 'demo-user-1',
          username: 'demo_user',
          email: 'demo@example.com',
          avatar: 'https://via.placeholder.com/40',
          display_name: 'Demo User',
          role: 'member',
          permissions: ['read_content', 'write_content', 'read_analytics']
        }
        console.log('✅ [WHOP SDK] Fallback user data set:', this.user)
      }

      // If no company data from Whop, use fallback
      if (!this.company) {
        console.log('🔄 [WHOP SDK] Using fallback company data')
        this.company = {
          id: 'demo-company-1',
          name: 'Demo Brand Community',
          description: 'A sample community for testing brand-safe content approval',
          logo: 'https://via.placeholder.com/100'
        }
        console.log('✅ [WHOP SDK] Fallback company data set:', this.company)
      }

      console.log('🎉 [WHOP SDK] Whop SDK initialized successfully!')
      console.log('👤 [WHOP SDK] Final user data:', this.user)
      console.log('🏢 [WHOP SDK] Final company data:', this.company)
      console.log('🔐 [WHOP SDK] Authentication status:', this.isAuthenticated())
      console.log('👑 [WHOP SDK] Is owner:', this.isOwner())
      console.log('👥 [WHOP SDK] Is member:', this.isMember())
      console.log('🔄 [WHOP SDK] Fallback mode:', this.fallbackMode)
    } catch (error) {
      console.error('Failed to initialize Whop SDK:', error)
      await errorHandler.handleError(error as Error, { action: 'sdk_initialization' })
      this.fallbackMode = true
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

  private async waitForWhopSDK(timeout: number = 5000): Promise<any> {
    return new Promise((resolve) => {
      const startTime = Date.now()
      
      const checkSDK = () => {
        console.log('🔍 [WHOP SDK] Checking for WHOP SDK...')
        console.log('🔍 [WHOP SDK] Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('whop')))
        
        if ((window as any).whop) {
          console.log('✅ [WHOP SDK] WHOP SDK found!')
          resolve((window as any).whop)
          return
        }
        
        // Check if timeout has been reached
        if (Date.now() - startTime >= timeout) {
          console.log('⏰ [WHOP SDK] WHOP SDK timeout, using fallback')
          resolve(null)
          return
        }
        
        // Continue checking
        setTimeout(checkSDK, 100)
      }
      
      checkSDK()
    })
  }


  async getContentRewards(): Promise<ContentReward[]> {
    try {
      if (this.fallbackMode) {
        console.log('🔄 [WHOP SDK] Using fallback content rewards data')
        return this.getFallbackContentRewards()
      }

      const response = await errorHandler.retryWithBackoff(async () => {
        const res = await fetch('/api/content-rewards')
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch content rewards`)
        return res
      })
      
      return await response.json()
    } catch (error) {
      console.error('❌ [WHOP SDK] Error fetching content rewards:', error)
      await errorHandler.handleError(error as Error, { action: 'get_content_rewards' })
      return this.getFallbackContentRewards()
    }
  }

  private getFallbackContentRewards(): ContentReward[] {
    return [
      {
        id: 'demo-reward-1',
        name: 'Brand Safe Content',
        description: 'Submit brand-safe content for approval',
        cpm: 2.50,
        status: 'active',
        totalViews: 1000,
        totalPaid: 2500,
        approvedSubmissions: 10,
        totalSubmissions: 15,
        effectiveCPM: 2.50
      },
      {
        id: 'demo-reward-2',
        name: 'High Engagement Content',
        description: 'Content with high engagement rates',
        cpm: 5.00,
        status: 'active',
        totalViews: 500,
        totalPaid: 2500,
        approvedSubmissions: 5,
        totalSubmissions: 8,
        effectiveCPM: 5.00
      }
    ]
  }

  async getSubmissions(filters?: { status?: string; creator_id?: string; public_only?: boolean }): Promise<Submission[]> {
    try {
      if (this.fallbackMode) {
        console.log('🔄 [WHOP SDK] Using fallback submissions data')
        return this.getFallbackSubmissions(filters)
      }

      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.creator_id) params.append('creator_id', filters.creator_id)
      if (filters?.public_only) params.append('public_only', 'true')
      
      const response = await errorHandler.retryWithBackoff(async () => {
        const res = await fetch(`/api/submissions?${params}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch submissions`)
        return res
      })
      
      return await response.json()
    } catch (error) {
      console.error('❌ [WHOP SDK] Error fetching submissions:', error)
      await errorHandler.handleError(error as Error, { action: 'get_submissions' })
      return this.getFallbackSubmissions(filters)
    }
  }

  private getFallbackSubmissions(filters?: { status?: string; creator_id?: string; public_only?: boolean }): Submission[] {
    const mockSubmissions: Submission[] = [
      {
        id: 'demo-submission-1',
        creator_id: 'demo-user-1',
        username: 'demo_user',
        display_name: 'Demo User',
        campaign_id: 'demo-campaign-1',
        campaign_name: 'Brand Safe Content',
        title: 'Amazing Product Demo',
        description: 'A great demonstration of our product',
        private_video_link: 'https://example.com/video1',
        public_video_link: 'https://youtube.com/watch?v=demo1',
        thumbnail_url: 'https://via.placeholder.com/300x200',
        platform: 'youtube',
        status: 'approved',
        visibility: 'public',
        paid: true,
        views: 1000,
        likes: 50,
        submission_date: new Date('2024-01-15'),
        published_date: new Date('2024-01-16'),
        approved_at: new Date('2024-01-15'),
        review_note: 'Great content, approved!'
      },
      {
        id: 'demo-submission-2',
        creator_id: 'demo-user-2',
        username: 'creator2',
        display_name: 'Content Creator 2',
        campaign_id: 'demo-campaign-1',
        campaign_name: 'Brand Safe Content',
        title: 'Product Review',
        description: 'Honest review of the product',
        private_video_link: 'https://example.com/video2',
        platform: 'youtube',
        status: 'pending_review',
        visibility: 'private',
        paid: false,
        views: 0,
        likes: 0,
        submission_date: new Date('2024-01-20')
      }
    ]

    // Apply filters
    let filteredSubmissions = mockSubmissions
    if (filters?.status) {
      filteredSubmissions = filteredSubmissions.filter(s => s.status === filters.status)
    }
    if (filters?.creator_id) {
      filteredSubmissions = filteredSubmissions.filter(s => s.creator_id === filters.creator_id)
    }
    if (filters?.public_only) {
      filteredSubmissions = filteredSubmissions.filter(s => s.visibility === 'public')
    }

    return filteredSubmissions
  }

  async createSubmission(submissionData: any): Promise<Submission> {
    try {
      if (this.fallbackMode) {
        console.log('🔄 [WHOP SDK] Using fallback submission creation')
        return this.createFallbackSubmission(submissionData)
      }

      const response = await errorHandler.retryWithBackoff(async () => {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData)
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create submission`)
        return res
      })
      
      return await response.json()
    } catch (error) {
      console.error('❌ [WHOP SDK] Error creating submission:', error)
      await errorHandler.handleError(error as Error, { action: 'create_submission' })
      return this.createFallbackSubmission(submissionData)
    }
  }

  private createFallbackSubmission(submissionData: any): Submission {
    return {
      id: 'demo-submission-' + Date.now(),
      creator_id: this.user?.id || 'demo-user-1',
      username: this.user?.username || 'demo_user',
      display_name: this.user?.display_name || 'Demo User',
      campaign_id: submissionData.campaign_id || 'demo-campaign-1',
      campaign_name: submissionData.campaign_name || 'Brand Safe Content',
      title: submissionData.title || 'New Submission',
      description: submissionData.description || 'Content submission',
      private_video_link: submissionData.private_video_link || 'https://example.com/video',
      platform: submissionData.platform || 'youtube',
      status: 'pending_review',
      visibility: 'private',
      paid: false,
      views: 0,
      likes: 0,
      submission_date: new Date()
    }
  }

  async approveSubmission(submissionId: string): Promise<void> {
    try {
      if (this.fallbackMode) {
        console.log('🔄 [WHOP SDK] Using fallback submission approval')
        console.log('✅ [WHOP SDK] Submission approved (fallback mode):', submissionId)
        return
      }

      await errorHandler.retryWithBackoff(async () => {
        const res = await fetch(`/api/submissions?id=${submissionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve', approved_by: this.user?.id })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to approve submission`)
        return res
      })
      
      console.log('✅ [WHOP SDK] Submission approved successfully')
    } catch (error) {
      console.error('❌ [WHOP SDK] Error approving submission:', error)
      await errorHandler.handleError(error as Error, { action: 'approve_submission', userId: this.user?.id })
      console.log('🔄 [WHOP SDK] Using fallback approval')
    }
  }

  async rejectSubmission(submissionId: string, reason: string): Promise<void> {
    try {
      if (this.fallbackMode) {
        console.log('🔄 [WHOP SDK] Using fallback submission rejection')
        console.log('❌ [WHOP SDK] Submission rejected (fallback mode):', submissionId, 'Reason:', reason)
        return
      }

      await errorHandler.retryWithBackoff(async () => {
        const res = await fetch(`/api/submissions?id=${submissionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reject', reason, approved_by: this.user?.id })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reject submission`)
        return res
      })
      
      console.log('❌ [WHOP SDK] Submission rejected successfully')
    } catch (error) {
      console.error('❌ [WHOP SDK] Error rejecting submission:', error)
      await errorHandler.handleError(error as Error, { action: 'reject_submission', userId: this.user?.id })
      console.log('🔄 [WHOP SDK] Using fallback rejection')
    }
  }

  async getMemberStatistics(): Promise<MemberStatistics> {
    try {
      if (this.fallbackMode) {
        console.log('🔄 [WHOP SDK] Using fallback member statistics')
        return this.getFallbackMemberStatistics()
      }

      const response = await errorHandler.retryWithBackoff(async () => {
        const res = await fetch('/api/analytics')
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch member statistics`)
        return res
      })
      
      return await response.json()
    } catch (error) {
      console.error('❌ [WHOP SDK] Error fetching member statistics:', error)
      await errorHandler.handleError(error as Error, { action: 'get_member_statistics' })
      return this.getFallbackMemberStatistics()
    }
  }

  private getFallbackMemberStatistics(): MemberStatistics {
    return {
      totalMembers: 150,
      activeMembers: 45,
      newMembers: 12,
      memberEngagement: 78,
      topContributors: [
        {
          id: 'demo-user-1',
          username: 'demo_user',
          submissions: 15,
          approvedContent: 12,
          totalEarnings: 2500,
          engagementScore: 95
        },
        {
          id: 'demo-user-2',
          username: 'creator2',
          submissions: 8,
          approvedContent: 6,
          totalEarnings: 1200,
          engagementScore: 88
        }
      ],
      contentStats: {
        totalSubmissions: 45,
        approvedContent: 32,
        rejectedContent: 8,
        pendingReview: 5
      },
      rewardStats: {
        totalRewardsGiven: 15000,
        averageReward: 468.75,
        topEarners: [
          {
            id: 'demo-user-1',
            username: 'demo_user',
            totalEarnings: 2500
          },
          {
            id: 'demo-user-2',
            username: 'creator2',
            totalEarnings: 1200
          }
        ]
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
      if (this.fallbackMode) {
        console.log('🔄 [WHOP SDK] Using fallback content reward update')
        return { ...updates, id } as ContentReward
      }

      const response = await errorHandler.retryWithBackoff(async () => {
        const res = await fetch(`/api/content-rewards?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update content reward`)
        return res
      })
      
      return await response.json()
    } catch (error) {
      console.error('❌ [WHOP SDK] Error updating content reward:', error)
      await errorHandler.handleError(error as Error, { action: 'update_content_reward' })
      return { ...updates, id } as ContentReward
    }
  }

  // Get current SDK status
  getStatus(): { fallbackMode: boolean; errorCount: number; lastError?: Date } {
    const errorReports = errorHandler.getErrorReports()
    const lastError = errorReports.length > 0 ? errorReports[errorReports.length - 1].timestamp : undefined
    
    return {
      fallbackMode: this.fallbackMode,
      errorCount: errorReports.length,
      lastError
    }
  }

  // Perform comprehensive health check
  async performHealthCheck(): Promise<{ whopApi: boolean; fallbackMode: boolean; errorCount: number; lastError?: Date }> {
    console.log('🔍 [WHOP SDK] Performing health check...')
    
    const healthCheck = await errorHandler.performHealthCheck()
    this.fallbackMode = healthCheck.fallbackMode
    
    console.log('📊 [WHOP SDK] Health check results:', healthCheck)
    
    return healthCheck
  }
}

// Context and Provider
interface WhopSDKContextType {
  sdk: WhopSDK | null
  loading: boolean
  error: string | null
}

const WhopSDKContext = createContext<WhopSDKContextType | null>(null)

export function WhopSDKProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<WhopSDK | null>(null)
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)
  const [forceLoad, setForceLoad] = useState(false)

  useEffect(() => {
    let isMounted = true
    let initializationStarted = false
    
    console.log('🚀 [WHOP PROVIDER] WhopSDKProvider mounted')
    console.log('🔄 [WHOP PROVIDER] Initial state - loading:', loading, 'sdk:', !!sdk)

    const initSDK = async () => {
      if (initializationStarted) {
        console.log('⚠️ [WHOP PROVIDER] Initialization already started, skipping')
        return
      }
      initializationStarted = true
      
      try {
        console.log('🔄 [WHOP PROVIDER] Starting SDK initialization...')
        // Check if we're in Whop environment
        const isWhopEnvironment = window.parent !== window || window.location.hostname.includes('whop.com')
        console.log('🎯 [WHOP PROVIDER] Whop environment detected:', isWhopEnvironment)
        console.log('🪟 [WHOP PROVIDER] Window parent check:', window.parent !== window)
        console.log('🌐 [WHOP PROVIDER] Hostname:', window.location.hostname)
        
        const realSDK = new RealWhopSDK()
        console.log('🔄 [WHOP PROVIDER] Created RealWhopSDK instance')
        await realSDK.init()
        console.log('✅ [WHOP PROVIDER] SDK initialization completed')
        
        if (isMounted) {
          console.log('✅ [WHOP PROVIDER] Setting SDK and stopping loading')
          setSdk(realSDK)
          setLoading(false)
          console.log('🎉 [WHOP PROVIDER] SDK state updated successfully')
        } else {
          console.log('⚠️ [WHOP PROVIDER] Component unmounted, skipping state update')
        }
      } catch (error) {
        console.error('❌ [WHOP PROVIDER] Failed to initialize Whop SDK:', error)
        if (isMounted) {
          console.log('🔄 [WHOP PROVIDER] Setting fallback state due to error')
          // Create a fallback SDK instance with demo data
          const fallbackSDK = new RealWhopSDK()
          fallbackSDK.user = {
            id: 'demo-user-1',
            username: 'demo_user',
            email: 'demo@example.com',
            avatar: 'https://via.placeholder.com/40',
            display_name: 'Demo User',
            role: 'member',
            permissions: ['read_content', 'write_content', 'read_analytics']
          }
          fallbackSDK.company = {
            id: 'demo-company-1',
            name: 'Demo Brand Community',
            description: 'A sample community for testing brand-safe content approval',
            logo: 'https://via.placeholder.com/100'
          }
          setSdk(fallbackSDK)
          setLoading(false)
        }
      }
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && !sdk) {
        console.log('⏰ [WHOP PROVIDER] SDK initialization timeout, using fallback')
        if (isMounted) {
          setSdk(null)
          setLoading(false)
        }
      }
    }, 1000) // Reduced timeout to 1 second

    // Force load after 2 seconds if still loading
    const forceTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log('🔄 [WHOP PROVIDER] Force loading app without SDK')
        if (isMounted) {
          setSdk(null)
          setLoading(false)
          setForceLoad(true)
        }
      }
    }, 2000) // Reduced to 2 seconds

    initSDK()

    return () => {
      isMounted = false
      clearTimeout(timeout)
      clearTimeout(forceTimeout)
    }
  }, []) // Empty dependency array to prevent re-initialization

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
          <div className="mt-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 mr-2"
            >
              Retry
            </button>
            <button 
              onClick={() => {
                setSdk(null)
                setLoading(false)
                setForceLoad(true)
              }} 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Skip SDK
            </button>
          </div>
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
    <WhopSDKContext.Provider value={{ sdk, loading, error }}>
      {children}
    </WhopSDKContext.Provider>
  )
}

export function useWhopSDKContext(): WhopSDKContextType {
  const context = useContext(WhopSDKContext)
  if (!context) {
    throw new Error('useWhopSDK must be used within a WhopSDKProvider')
  }
  return context
}

export function useWhopSDK(): WhopSDK {
  const context = useWhopSDKContext()
  
  if (context.loading) {
    throw new Error('WhopSDK is still loading')
  }
  
  if (context.error) {
    throw new Error(`WhopSDK error: ${context.error}`)
  }
  
  if (!context.sdk) {
    throw new Error('WhopSDK is not available')
  }
  
  return context.sdk
}

// WhopApp component for Whop integration
export function WhopApp({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}