// Whop SDK implementation for brand-safe content approval app
import React, { createContext, useContext } from 'react'

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
  getMemberStatistics(): Promise<MemberStatistics>
  exportMemberStats(options: ExportOptions): Promise<Blob>
  getContentRewards(): Promise<ContentReward[]>
  getSubmissions(): Promise<Submission[]>
  createContentReward(reward: Omit<ContentReward, 'id'>): Promise<ContentReward>
  updateContentReward(id: string, updates: Partial<ContentReward>): Promise<ContentReward>
  approveSubmission(id: string): Promise<void>
  rejectSubmission(id: string, reason: string): Promise<void>
}

export class WhopSDKWrapper implements WhopSDK {
  user: WhopUser | null = null
  company: WhopCompany | null = null
  private isWhopMemberFlag: boolean = true // Simulate Whop membership
  private whopAppId: string | null = null
  private whopAppSecret: string | null = null

  async init(): Promise<void> {
    try {
      // Check if we're in browser environment
      if (typeof window !== 'undefined') {
        // Check if we're in a Whop iframe
        const isWhopIframe = window.parent !== window || 
                             window.location !== window.parent.location ||
                             document.referrer.includes('whop.com') ||
                             window.location.hostname.includes('whop.com')
        
        if (isWhopIframe) {
          // We're in Whop, try to use real Whop SDK
          await this.initializeRealWhopSDK()
        } else {
          // We're in development, use mock data
          await this.initializeMockWhopSDK()
        }
      } else {
        // In server environment, get credentials from environment
        this.whopAppId = process.env.WHOP_APP_ID || null
        this.whopAppSecret = process.env.WHOP_APP_SECRET || null
        
        // In production, this would initialize the actual Whop SDK
        if (this.whopAppId && this.whopAppSecret) {
          // Real Whop SDK initialization would go here
          await this.initializeRealWhopSDK()
        } else {
          // Fallback to mock data for development
          await this.initializeMockWhopSDK()
        }
      }
      
    } catch (error) {
      console.error('Failed to initialize Whop SDK:', error)
      // Fallback to mock data
      await this.initializeMockWhopSDK()
    }
  }

  private async initializeRealWhopSDK(): Promise<void> {
    try {
      // In Whop iframe, try to get user data from URL parameters or postMessage
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get('user_id') || 'whop-user-1'
      const userRole = urlParams.get('user_role') || 'member'
      const isOwner = urlParams.get('is_owner') === 'true' || userRole === 'owner' || userRole === 'admin'
      
      // Create user data based on Whop context
      this.user = {
        id: userId,
        username: urlParams.get('username') || 'whop_user',
        email: urlParams.get('email') || 'user@example.com',
        avatar: urlParams.get('avatar') || 'https://via.placeholder.com/40',
        display_name: urlParams.get('display_name') || 'Whop User',
        role: isOwner ? 'owner' : 'member',
        permissions: isOwner 
          ? ['admin', 'member:stats:export', 'read_content', 'write_content', 'read_analytics']
          : ['read_content', 'write_content', 'read_analytics']
      }

      // Create company data
      this.company = {
        id: urlParams.get('company_id') || 'whop-company-1',
        name: urlParams.get('company_name') || 'Whop Community',
        description: 'Brand-safe content rewards community'
      }

      this.isWhopMemberFlag = true
      this.determineUserRole()
      
      console.log('Whop SDK initialized with user:', this.user)
    } catch (error) {
      console.error('Failed to initialize real Whop SDK:', error)
      // Fallback to mock data
      await this.initializeMockWhopSDK()
    }
  }

  private async initializeMockWhopSDK(): Promise<void> {
    // Mock initialization for development
    await new Promise(resolve => setTimeout(resolve, 500))
    
    this.user = {
      id: 'whop-user-1',
      username: 'whop_user',
      email: 'user@example.com',
      avatar: 'https://via.placeholder.com/40',
      display_name: 'Whop User',
      role: 'member',
      permissions: [
        'read_content',
        'write_content', 
        'read_analytics'
      ]
    }
    
    this.company = {
      id: 'whop-company-1',
      name: 'Whop Community',
      description: 'Brand-safe content rewards community'
    }
    
    this.isWhopMemberFlag = true
    this.determineUserRole()
  }

  private determineUserRole(): void {
    if (!this.user) return
    
    // For Whop integration, check if user has owner permissions
    // In a real Whop app, this would check actual Whop permissions
    if (this.user.permissions.includes('admin') || this.user.permissions.includes('member:stats:export')) {
      this.user.role = 'owner'
    } 
    // Default to member for all other users (including regular Whop members)
    else {
      this.user.role = 'member'
    }
  }

  // Method to simulate different Whop permission scenarios for testing
  public simulateWhopPermissions(permissions: string[]): void {
    if (!this.user) return
    
    this.user.permissions = permissions
    this.determineUserRole()
  }

  isAuthenticated(): boolean {
    return true // Mock authentication
  }

  isWhopMember(): boolean {
    // In a real implementation, this would check if the user is a member of the Whop community
    return this.isWhopMemberFlag
  }

  getUserRole(): 'member' | 'owner' | 'admin' | null {
    if (!this.user) return null
    return this.user.role
  }

  isOwner(): boolean {
    return this.user?.role === 'owner' || this.user?.role === 'admin'
  }

  isMember(): boolean {
    return this.user?.role === 'member'
  }

  hasPermission(permission: string): boolean {
    if (!this.user) return false
    return this.user.permissions.includes(permission)
  }

  async getMemberStatistics(): Promise<MemberStatistics> {
    // Mock member statistics data
    return {
      totalMembers: 2847,
      activeMembers: 1923,
      newMembers: 156,
      memberEngagement: 78.5,
      topContributors: [
        {
          id: 'user-1',
          username: 'alice_creator',
          submissions: 45,
          approvedContent: 38,
          totalEarnings: 1250.50,
          engagementScore: 92.3
        },
        {
          id: 'user-2',
          username: 'bob_photographer',
          submissions: 32,
          approvedContent: 28,
          totalEarnings: 890.25,
          engagementScore: 88.7
        },
        {
          id: 'user-3',
          username: 'charlie_educator',
          submissions: 28,
          approvedContent: 25,
          totalEarnings: 675.80,
          engagementScore: 85.1
        }
      ],
      contentStats: {
        totalSubmissions: 156,
        approvedContent: 89,
        rejectedContent: 23,
        pendingReview: 44
      },
      rewardStats: {
        totalRewardsGiven: 15420,
        averageReward: 2.15,
        topEarners: [
          {
            id: 'user-1',
            username: 'alice_creator',
            totalEarnings: 1250.50
          },
          {
            id: 'user-2',
            username: 'bob_photographer',
            totalEarnings: 890.25
          },
          {
            id: 'user-3',
            username: 'charlie_educator',
            totalEarnings: 675.80
          }
        ]
      }
    }
  }

  async exportMemberStats(options: ExportOptions): Promise<Blob> {
    const stats = await this.getMemberStatistics()
    
    if (options.format === 'csv') {
      const csvContent = this.generateCSV(stats, options)
      return new Blob([csvContent], { type: 'text/csv' })
    } else {
      // For Excel format, we would use a library like xlsx
      // For now, return CSV as fallback
      const csvContent = this.generateCSV(stats, options)
      return new Blob([csvContent], { type: 'text/csv' })
    }
  }

  private generateCSV(stats: MemberStatistics, options: ExportOptions): string {
    const headers = ['Metric', 'Value', 'Date Range']
    const rows = [
      ['Total Members', stats.totalMembers.toString(), `${options.dateRange.start.toDateString()} - ${options.dateRange.end.toDateString()}`],
      ['Active Members', stats.activeMembers.toString(), ''],
      ['New Members', stats.newMembers.toString(), ''],
      ['Member Engagement', `${stats.memberEngagement}%`, ''],
      ['Total Submissions', stats.contentStats.totalSubmissions.toString(), ''],
      ['Approved Content', stats.contentStats.approvedContent.toString(), ''],
      ['Rejected Content', stats.contentStats.rejectedContent.toString(), ''],
      ['Pending Review', stats.contentStats.pendingReview.toString(), ''],
      ['Total Rewards Given', stats.rewardStats.totalRewardsGiven.toString(), ''],
      ['Average Reward', `$${stats.rewardStats.averageReward}`, '']
    ]

    // Add top contributors
    rows.push(['', '', ''])
    rows.push(['Top Contributors', '', ''])
    rows.push(['Username', 'Submissions', 'Approved', 'Earnings', 'Engagement Score'])
    
    stats.topContributors.forEach(contributor => {
      rows.push([
        contributor.username,
        contributor.submissions.toString(),
        contributor.approvedContent.toString(),
        `$${contributor.totalEarnings}`,
        `${contributor.engagementScore}%`
      ])
    })

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  async getContentRewards(): Promise<ContentReward[]> {
    try {
      // Try to fetch from API first
      const response = await fetch('/api/content-rewards?company_id=whop-company-1')
      if (!response.ok) {
        throw new Error('Failed to fetch content rewards')
      }
      const data = await response.json()
      // Transform database format to interface format
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        cpm: item.cpm,
        status: item.status,
        totalViews: item.total_views,
        totalPaid: item.total_paid,
        approvedSubmissions: item.approved_submissions,
        totalSubmissions: item.total_submissions,
        effectiveCPM: item.effective_cpm
      }))
    } catch (error) {
      console.error('Error fetching content rewards:', error)
      // Fallback to mock data
      return [
        {
          id: '1',
          name: 'Make videos different coaching businesses you can start',
          description: 'Create content about coaching business opportunities',
          cpm: 4.00,
          status: 'active',
          totalViews: 0,
          totalPaid: 0,
          approvedSubmissions: 0,
          totalSubmissions: 0,
          effectiveCPM: 0
        }
      ]
    }
  }

  // Real Whop API integration methods
  private async makeWhopAPIRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.whopAppId || !this.whopAppSecret) {
      throw new Error('Whop credentials not configured')
    }

    const url = `https://api.whop.com/api/v2/${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.whopAppSecret}`,
      'Content-Type': 'application/json',
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`Whop API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Get current user from Whop API
  private async getCurrentUserFromWhop(): Promise<any> {
    try {
      // Try to get user from Whop API
      const response = await fetch('/api/whop/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error fetching user from Whop:', error)
    }
    return null
  }

  // Get current company from Whop API
  private async getCurrentCompanyFromWhop(): Promise<any> {
    try {
      // Try to get company from Whop API
      const response = await fetch('/api/whop/company', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error fetching company from Whop:', error)
    }
    return null
  }

  // Enhanced methods for real Whop integration
  async getWhopUser(): Promise<WhopUser | null> {
    try {
      // First try to get user from our API endpoint
      const userData = await this.getCurrentUserFromWhop()
      if (userData) {
        return {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar_url,
          display_name: userData.display_name,
          role: userData.role || 'member',
          permissions: userData.permissions || ['read_content', 'write_content', 'read_analytics']
        }
      }

      // Fallback to direct Whop API call
      const whopUserData = await this.makeWhopAPIRequest('users/me')
      return {
        id: whopUserData.id,
        username: whopUserData.username,
        email: whopUserData.email,
        avatar: whopUserData.avatar_url,
        display_name: whopUserData.display_name,
        role: whopUserData.role || 'member',
        permissions: whopUserData.permissions || ['read_content', 'write_content', 'read_analytics']
      }
    } catch (error) {
      console.error('Error fetching Whop user:', error)
      return null
    }
  }

  async getWhopCompany(): Promise<WhopCompany | null> {
    try {
      // First try to get company from our API endpoint
      const companyData = await this.getCurrentCompanyFromWhop()
      if (companyData) {
        return {
          id: companyData.id,
          name: companyData.name,
          description: companyData.description,
          logo: companyData.logo_url
        }
      }

      // Fallback to direct Whop API call
      const whopCompanyData = await this.makeWhopAPIRequest('companies/me')
      return {
        id: whopCompanyData.id,
        name: whopCompanyData.name,
        description: whopCompanyData.description,
        logo: whopCompanyData.logo_url
      }
    } catch (error) {
      console.error('Error fetching Whop company:', error)
      return null
    }
  }

  async syncWithWhop(): Promise<void> {
    try {
      // Sync user data from Whop
      const whopUser = await this.getWhopUser()
      if (whopUser) {
        this.user = whopUser
        this.determineUserRole()
      }

      // Sync company data from Whop
      const whopCompany = await this.getWhopCompany()
      if (whopCompany) {
        this.company = whopCompany
      }
    } catch (error) {
      console.error('Error syncing with Whop:', error)
    }
  }

  async getSubmissions(): Promise<Submission[]> {
    try {
      const response = await fetch('/api/submissions?company_id=whop-company-1')
      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }
      const data = await response.json()
      // Transform database format to interface format
      return data.map((item: any) => ({
        id: item.id,
        user: item.username || 'Unknown User',
        status: item.status,
        paid: item.paid,
        views: item.views,
        likes: item.likes,
        submissionDate: new Date(item.submission_date),
        publishedDate: item.published_date ? new Date(item.published_date) : null,
        content: {
          title: item.title,
          privateVideoLink: item.private_video_link,
          publicVideoLink: item.public_video_link,
          thumbnail: item.thumbnail_url,
          platform: item.platform
        }
      }))
    } catch (error) {
      console.error('Error fetching submissions:', error)
      // Fallback to mock data
      return [
        {
          id: '1',
          user: 'creator123',
          status: 'pending_approval',
          paid: false,
          views: 0,
          likes: 0,
          submissionDate: new Date(),
          publishedDate: null,
          content: {
            title: 'Sample Video Title',
            privateVideoLink: 'https://youtube.com/watch?v=sample',
            publicVideoLink: null,
            thumbnail: 'https://img.youtube.com/vi/sample/maxresdefault.jpg',
            platform: 'youtube'
          }
        }
      ]
    }
  }

  async createContentReward(reward: Omit<ContentReward, 'id'>): Promise<ContentReward> {
    // Mock implementation - in production, this would call the real Whop API
    const newReward: ContentReward = {
      ...reward,
      id: Date.now().toString()
    }
    return newReward
  }

  async updateContentReward(id: string, updates: Partial<ContentReward>): Promise<ContentReward> {
    // Mock implementation - in production, this would call the real Whop API
    return { ...updates, id } as ContentReward
  }

  async approveSubmission(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/submissions?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          approved_by: this.user?.id || 'whop-user-1'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to approve submission')
      }
      
      console.log(`Submission ${id} approved successfully`)
    } catch (error) {
      console.error('Error approving submission:', error)
      throw error
    }
  }

  async rejectSubmission(id: string, reason: string): Promise<void> {
    try {
      const response = await fetch(`/api/submissions?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          reason: reason,
          approved_by: this.user?.id || 'whop-user-1'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to reject submission')
      }
      
      console.log(`Submission ${id} rejected: ${reason}`)
    } catch (error) {
      console.error('Error rejecting submission:', error)
      throw error
    }
  }
}

// Mock SDK for development when official SDK is not available
export class MockWhopSDK implements WhopSDK {
  user: WhopUser | null = null
  company: WhopCompany | null = null
  private isWhopMemberFlag: boolean = true // Simulate Whop membership

  async init(): Promise<void> {
    // Mock initialization
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate Whop SDK user data with permissions
    // In production, this would come from the actual Whop SDK
      this.user = {
      id: 'whop-user-1',
      username: 'whop_user',
      email: 'user@example.com',
        avatar: 'https://via.placeholder.com/40',
      display_name: 'Whop User',
      role: 'member', // Default to member for Whop users
      permissions: [
        'read_content',
        'write_content', 
        'read_analytics'
      ]
      }
      
      this.company = {
      id: 'whop-company-1',
      name: 'Whop Community',
      description: 'Brand-safe content rewards community'
    }
    
    this.isWhopMemberFlag = true
    
    // Determine role based on permissions
    this.determineUserRole()
  }

  private determineUserRole(): void {
    if (!this.user) return
    
    // Determine role based on Whop permissions
    // Owners have admin permissions or member:stats:export permission
    if (this.user.permissions.includes('admin') || this.user.permissions.includes('member:stats:export')) {
      this.user.role = 'owner'
    } 
    // Members have basic content permissions
    else if (this.user.permissions.includes('read_content') && this.user.permissions.includes('write_content')) {
      this.user.role = 'member'
    } 
    // Default to member if permissions are unclear
    else {
      this.user.role = 'member'
    }
  }

  // Method to simulate different Whop permission scenarios for testing
  public simulateWhopPermissions(permissions: string[]): void {
    if (!this.user) return
    
    this.user.permissions = permissions
    this.determineUserRole()
  }

  isAuthenticated(): boolean {
    return true // Mock authentication
  }

  isWhopMember(): boolean {
    // In a real implementation, this would check if the user is a member of the Whop community
    return this.isWhopMemberFlag
  }

  getUserRole(): 'member' | 'owner' | 'admin' | null {
    if (!this.user) return null
    return this.user.role
  }

  isOwner(): boolean {
    return this.user?.role === 'owner' || this.user?.role === 'admin'
  }

  isMember(): boolean {
    return this.user?.role === 'member'
  }

  hasPermission(permission: string): boolean {
    if (!this.user) return false
    return this.user.permissions.includes(permission)
  }

  async getMemberStatistics(): Promise<MemberStatistics> {
    // Mock member statistics data
    return {
      totalMembers: 2847,
      activeMembers: 1923,
      newMembers: 156,
      memberEngagement: 78.5,
      topContributors: [
        {
          id: 'user-1',
          username: 'alice_creator',
          submissions: 45,
          approvedContent: 38,
          totalEarnings: 1250.50,
          engagementScore: 92.3
        },
        {
          id: 'user-2',
          username: 'bob_photographer',
          submissions: 32,
          approvedContent: 28,
          totalEarnings: 890.25,
          engagementScore: 88.7
        },
        {
          id: 'user-3',
          username: 'charlie_educator',
          submissions: 28,
          approvedContent: 25,
          totalEarnings: 675.80,
          engagementScore: 85.1
        }
      ],
      contentStats: {
        totalSubmissions: 156,
        approvedContent: 89,
        rejectedContent: 23,
        pendingReview: 44
      },
      rewardStats: {
        totalRewardsGiven: 15420,
        averageReward: 2.15,
        topEarners: [
          {
            id: 'user-1',
            username: 'alice_creator',
            totalEarnings: 1250.50
          },
          {
            id: 'user-2',
            username: 'bob_photographer',
            totalEarnings: 890.25
          },
          {
            id: 'user-3',
            username: 'charlie_educator',
            totalEarnings: 675.80
          }
        ]
      }
    }
  }

  async exportMemberStats(options: ExportOptions): Promise<Blob> {
    const stats = await this.getMemberStatistics()
    
    if (options.format === 'csv') {
      const csvContent = this.generateCSV(stats, options)
      return new Blob([csvContent], { type: 'text/csv' })
    } else {
      // For Excel format, we would use a library like xlsx
      // For now, return CSV as fallback
      const csvContent = this.generateCSV(stats, options)
      return new Blob([csvContent], { type: 'text/csv' })
    }
  }

  private generateCSV(stats: MemberStatistics, options: ExportOptions): string {
    const headers = ['Metric', 'Value', 'Date Range']
    const rows = [
      ['Total Members', stats.totalMembers.toString(), `${options.dateRange.start.toDateString()} - ${options.dateRange.end.toDateString()}`],
      ['Active Members', stats.activeMembers.toString(), ''],
      ['New Members', stats.newMembers.toString(), ''],
      ['Member Engagement', `${stats.memberEngagement}%`, ''],
      ['Total Submissions', stats.contentStats.totalSubmissions.toString(), ''],
      ['Approved Content', stats.contentStats.approvedContent.toString(), ''],
      ['Rejected Content', stats.contentStats.rejectedContent.toString(), ''],
      ['Pending Review', stats.contentStats.pendingReview.toString(), ''],
      ['Total Rewards Given', stats.rewardStats.totalRewardsGiven.toString(), ''],
      ['Average Reward', `$${stats.rewardStats.averageReward}`, '']
    ]

    // Add top contributors
    rows.push(['', '', ''])
    rows.push(['Top Contributors', '', ''])
    rows.push(['Username', 'Submissions', 'Approved', 'Earnings', 'Engagement Score'])
    
    stats.topContributors.forEach(contributor => {
      rows.push([
        contributor.username,
        contributor.submissions.toString(),
        contributor.approvedContent.toString(),
        `$${contributor.totalEarnings}`,
        `${contributor.engagementScore}%`
      ])
    })

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  async getContentRewards(): Promise<ContentReward[]> {
    // Mock implementation for development
    return [
      {
        id: '1',
        name: 'Make videos different coaching businesses you can start',
        description: 'Create content about coaching business opportunities',
        cpm: 4.00,
        status: 'active',
        totalViews: 0,
        totalPaid: 0,
        approvedSubmissions: 0,
        totalSubmissions: 0,
        effectiveCPM: 0
      }
    ]
  }

  async getSubmissions(): Promise<Submission[]> {
    // Mock implementation for development
    return [
      {
        id: '1',
        user: 'creator123',
        status: 'pending_approval',
        paid: false,
        views: 0,
        likes: 0,
        submissionDate: new Date(),
        publishedDate: null,
        content: {
          title: 'Sample Video Title',
          privateVideoLink: 'https://youtube.com/watch?v=sample',
          publicVideoLink: null,
          thumbnail: 'https://img.youtube.com/vi/sample/maxresdefault.jpg',
          platform: 'youtube'
        }
      }
    ]
  }

  async createContentReward(reward: Omit<ContentReward, 'id'>): Promise<ContentReward> {
    // Mock implementation for development
    const newReward: ContentReward = {
      ...reward,
      id: Date.now().toString()
    }
    return newReward
  }

  async updateContentReward(id: string, updates: Partial<ContentReward>): Promise<ContentReward> {
    // Mock implementation for development
    return { ...updates, id } as ContentReward
  }

  async approveSubmission(id: string): Promise<void> {
    // Mock implementation for development
    console.log(`Approving submission ${id}`)
  }

  async rejectSubmission(id: string, reason: string): Promise<void> {
    // Mock implementation for development
    console.log(`Rejecting submission ${id}: ${reason}`)
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
