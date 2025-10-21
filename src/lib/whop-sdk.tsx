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

export interface WhopSDK {
  user: WhopUser | null
  company: WhopCompany | null
  init(): Promise<void>
  isAuthenticated(): boolean
  isWhopMember(): boolean
  getMemberStatistics(): Promise<MemberStatistics>
  exportMemberStats(options: ExportOptions): Promise<Blob>
}

export class WhopSDKWrapper implements WhopSDK {
  user: WhopUser | null = null
  company: WhopCompany | null = null
  private isMember: boolean = true // Simulate Whop membership

  async init(): Promise<void> {
    try {
      // Check URL parameters or localStorage for testing different user types
      const urlParams = new URLSearchParams(window.location.search)
      const userType = urlParams.get('userType') || localStorage.getItem('userType') || 'member'
      
      if (userType === 'non-member') {
        this.isMember = false
        this.user = null
        this.company = null
      } else {
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
        this.isMember = true
      }
    } catch (error) {
      console.error('Failed to initialize Whop SDK:', error)
    }
  }

  isAuthenticated(): boolean {
    return true // Mock authentication
  }

  isWhopMember(): boolean {
    // In a real implementation, this would check if the user is a member of the Whop community
    return this.isMember
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
}

// Mock SDK for development when official SDK is not available
export class MockWhopSDK implements WhopSDK {
  user: WhopUser | null = null
  company: WhopCompany | null = null
  private isMember: boolean = true // Simulate Whop membership

  async init(): Promise<void> {
    // Mock initialization
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check URL parameters or localStorage for testing different user types
    const urlParams = new URLSearchParams(window.location.search)
    const userType = urlParams.get('userType') || localStorage.getItem('userType') || 'member'
    
    if (userType === 'non-member') {
      this.isMember = false
      this.user = null
      this.company = null
    } else {
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
      this.isMember = true
    }
  }

  isAuthenticated(): boolean {
    return true // Mock authentication
  }

  isWhopMember(): boolean {
    // In a real implementation, this would check if the user is a member of the Whop community
    return this.isMember
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
