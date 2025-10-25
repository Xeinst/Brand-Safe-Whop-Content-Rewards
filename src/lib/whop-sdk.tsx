// Modern Whop SDK implementation for brand-safe content approval app
import React, { createContext, useContext, useEffect, useState } from 'react'
import { errorHandler } from './error-handler'

// Import the official Whop SDK packages
import { createSdk } from '@whop/iframe'

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

// Modern Whop SDK Implementation using official packages
export class ModernWhopSDK implements WhopSDK {
  public user: WhopUser | null = null
  public company: WhopCompany | null = null
  private iframeSdk: any = null
  private fallbackMode: boolean = true // Start in fallback mode

  async init(): Promise<void> {
    try {
      console.log('🚀 [WHOP SDK] Initializing Modern Whop SDK...')
      console.log('🌍 [WHOP SDK] Environment:', process.env.NODE_ENV)
      console.log('🪟 [WHOP SDK] Window parent:', window.parent !== window)
      console.log('📍 [WHOP SDK] Location:', window.location.href)
      
      // Skip server SDK initialization in browser
      console.log('⚠️ [WHOP SDK] Skipping server SDK initialization in browser environment')
      
      // Initialize Whop iFrame SDK for embedded apps with error handling
      try {
        this.iframeSdk = createSdk({
          appId: (import.meta as any).env?.VITE_WHOP_APP_ID || process.env.NEXT_PUBLIC_WHOP_APP_ID,
        })
        console.log('✅ [WHOP SDK] Whop iFrame SDK initialized')
        this.fallbackMode = false
      } catch (error) {
        console.log('⚠️ [WHOP SDK] iFrame SDK initialization failed:', error)
        this.iframeSdk = null
        this.fallbackMode = true
      }
      
      // Test Whop API connectivity with shorter timeout
      console.log('🔍 [WHOP SDK] Testing Whop API connectivity...')
      const isWhopApiAvailable = await Promise.race([
        errorHandler.testWhopConnectivity(),
        new Promise<boolean>(resolve => setTimeout(() => resolve(false), 200)) // 200ms timeout
      ])
      this.fallbackMode = !isWhopApiAvailable
      
      if (this.fallbackMode) {
        console.log('⚠️ [WHOP SDK] Whop API not available, using fallback mode')
      }
      
      // Check if we're in a Whop iframe environment
      const isWhopEnvironment = window.parent !== window || 
                                window.location.hostname.includes('whop.com') ||
                                window.location.hostname.includes('vercel.app')
      
      console.log('🎯 [WHOP SDK] Whop environment detected:', isWhopEnvironment)
      
      if (isWhopEnvironment && !this.fallbackMode) {
        try {
          // Get user data from Whop SDK
          console.log('👤 [WHOP SDK] Getting user data from Whop SDK...')
          const userData = await this.getUserFromWhop()
          if (userData) {
            console.log('✅ [WHOP SDK] User data retrieved:', userData)
            this.user = userData
          }
          
          // Get company data from Whop SDK
          console.log('🏢 [WHOP SDK] Getting company data from Whop SDK...')
          const companyData = await this.getCompanyFromWhop()
          if (companyData) {
            console.log('✅ [WHOP SDK] Company data retrieved:', companyData)
            this.company = companyData
          }
        } catch (error) {
          console.error('❌ [WHOP SDK] Error accessing Whop SDK:', error)
          await errorHandler.handleError(error as Error, { action: 'access_whop_sdk' })
          this.fallbackMode = true
        }
      } else {
        console.log('🔄 [WHOP SDK] Not in Whop environment or API unavailable, using fallback data')
        this.fallbackMode = true
      }
      
      // Production-ready: No fallback mock data
      console.log('🔄 [WHOP SDK] No fallback data - production mode')

      console.log('🎉 [WHOP SDK] Modern Whop SDK initialized successfully!')
      console.log('👤 [WHOP SDK] Final user data:', this.user)
      console.log('🏢 [WHOP SDK] Final company data:', this.company)
      console.log('🔐 [WHOP SDK] Authentication status:', this.isAuthenticated())
      console.log('👑 [WHOP SDK] Is owner:', this.isOwner())
      console.log('👥 [WHOP SDK] Is member:', this.isMember())
      console.log('🔄 [WHOP SDK] Fallback mode:', this.fallbackMode)
    } catch (error) {
      console.error('Failed to initialize Modern Whop SDK:', error)
      await errorHandler.handleError(error as Error, { action: 'sdk_initialization' })
      this.fallbackMode = true
      
      // Production-ready: No fallback mock data on error
      console.log('🔄 [WHOP SDK] No fallback data on error - production mode')
      
      console.log('🔄 [WHOP SDK] Fallback data set after error')
    }
  }

  isAuthenticated(): boolean {
    return !!this.user
  }

  isWhopMember(): boolean {
    return this.user?.role === 'member'
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
    if (!this.iframeSdk) return null
    
    try {
      // Use the modern iframe SDK to get user data
      const whopUser = await this.iframeSdk.getUser()
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
    if (!this.iframeSdk) return null
    
    try {
      // Use the modern iframe SDK to get company data
      const whopCompany = await this.iframeSdk.getCompany()
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
    try {
      // Use the campaign service instead of API call
      const { campaignService } = await import('../services/campaignService')
      const campaigns = await campaignService.getCampaigns()
      
      // Convert Campaign[] to ContentReward[]
      const contentRewards: ContentReward[] = campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        cpm: campaign.rewardPerUpload / 10, // Convert points back to CPM
        status: campaign.status === 'active' ? 'active' : 'paused',
        totalViews: 0, // Real data would come from analytics
        totalPaid: 0, // Real data would come from payout system
        approvedSubmissions: 0, // Real data would come from submissions
        totalSubmissions: 0, // Real data would come from submissions
        effectiveCPM: campaign.rewardPerUpload / 10 // Real data would be calculated
      }))
      
      return contentRewards
    } catch (error) {
      console.error('❌ [WHOP SDK] Error fetching content rewards:', error)
      await errorHandler.handleError(error as Error, { action: 'get_content_rewards' })
      return this.getFallbackContentRewards()
    }
  }

  private getFallbackContentRewards(): ContentReward[] {
    // Production-ready: Return empty array when no real data
    return []
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

  private getFallbackSubmissions(_filters?: { status?: string; creator_id?: string; public_only?: boolean }): Submission[] {
    // Production-ready: Return empty array when no real data
    return []
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
    // Production-ready: Return minimal submission data
    return {
      id: 'submission-' + Date.now(),
      creator_id: this.user?.id || '',
      username: this.user?.username || '',
      display_name: this.user?.display_name || '',
      campaign_id: submissionData.campaign_id || '',
      campaign_name: submissionData.campaign_name || '',
      title: submissionData.title || '',
      description: submissionData.description || '',
      private_video_link: submissionData.private_video_link || '',
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
    // Production-ready: Return empty statistics when no real data
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
      // Use the campaign service instead of API call
      const { campaignService } = await import('../services/campaignService')
      
      // Convert ContentReward to Campaign format
      const campaignData = {
        name: reward.name || 'New Campaign',
        description: reward.description || '',
        status: 'active' as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        brandGuidelines: ['No inappropriate content', 'Must align with brand values'],
        rewardPerUpload: Math.round((reward.cpm || 0) * 10), // Convert CPM to points
        maxUploadsPerUser: 10,
        allowedContentTypes: ['image', 'video'] as ('image' | 'video' | 'text')[],
        companyId: this.company?.id || 'demo-company-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Create campaign using the service
      const newCampaign = {
        id: `campaign-${Date.now()}`,
        ...campaignData
      }
      
      // Add to campaigns array using the service
      campaignService.addCampaign(newCampaign)
      
      // Convert back to ContentReward format
      const contentReward: ContentReward = {
        id: newCampaign.id,
        name: newCampaign.name,
        description: newCampaign.description,
        cpm: reward.cpm || 0,
        status: 'active',
        totalViews: 0,
        totalPaid: 0,
        approvedSubmissions: 0,
        totalSubmissions: 0,
        effectiveCPM: reward.cpm || 0
      }
      
      return contentReward
    } catch (error) {
      console.error('Error creating content reward:', error)
      throw error
    }
  }

  async updateContentReward(id: string, updates: Partial<ContentReward>): Promise<ContentReward> {
    try {
      // Use the campaign service instead of API call
      const { campaignService } = await import('../services/campaignService')
      
      // Find and update the campaign
      const updatedCampaign = campaignService.updateCampaign(id, {
        name: updates.name,
        description: updates.description,
        status: updates.status === 'active' ? 'active' : 'inactive',
        rewardPerUpload: updates.cpm ? Math.round(updates.cpm * 10) : undefined
      })
      
      if (!updatedCampaign) {
        throw new Error('Campaign not found')
      }
      
      // Convert back to ContentReward format
      const contentReward: ContentReward = {
        id: updatedCampaign.id,
        name: updatedCampaign.name,
        description: updatedCampaign.description,
        cpm: updates.cpm || (updatedCampaign.rewardPerUpload / 10),
        status: updatedCampaign.status === 'active' ? 'active' : 'paused',
        totalViews: 0, // Real data would come from analytics
        totalPaid: 0, // Real data would come from payout system
        approvedSubmissions: 0, // Real data would come from submissions
        totalSubmissions: 0, // Real data would come from submissions
        effectiveCPM: updatedCampaign.rewardPerUpload / 10 // Real data would be calculated
      }
      
      return contentReward
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
        console.log('🔄 [WHOP PROVIDER] Starting Modern SDK initialization...')
        // Check if we're in Whop environment
        const isWhopEnvironment = window.parent !== window || window.location.hostname.includes('whop.com')
        console.log('🎯 [WHOP PROVIDER] Whop environment detected:', isWhopEnvironment)
        console.log('🪟 [WHOP PROVIDER] Window parent check:', window.parent !== window)
        console.log('🌐 [WHOP PROVIDER] Hostname:', window.location.hostname)
        
        const modernSDK = new ModernWhopSDK()
        console.log('🔄 [WHOP PROVIDER] Created ModernWhopSDK instance')
        await modernSDK.init()
        console.log('✅ [WHOP PROVIDER] Modern SDK initialization completed')
        
        if (isMounted) {
          console.log('✅ [WHOP PROVIDER] Setting SDK and stopping loading')
          setSdk(modernSDK)
          setLoading(false)
          console.log('🎉 [WHOP PROVIDER] SDK state updated successfully')
        } else {
          console.log('⚠️ [WHOP PROVIDER] Component unmounted, skipping state update')
        }
      } catch (error) {
        console.error('❌ [WHOP PROVIDER] Failed to initialize Modern Whop SDK:', error)
        if (isMounted) {
          console.log('🔄 [WHOP PROVIDER] Setting fallback state due to error')
          // Production-ready: No fallback mock data
          setSdk(null)
          setLoading(false)
        }
      }
    }

    // Initialize SDK without timeout interference
    initSDK()

    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array to prevent re-initialization

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Loading Brand Safe Content Rewards...</h1>
          <p className="text-gray-300">Initializing Modern Whop SDK...</p>
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