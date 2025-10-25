import { Campaign, CampaignSubmission, CampaignStats } from '../types/campaign'

export class CampaignService {
  private campaigns: Campaign[] = []
  private submissions: CampaignSubmission[] = []

  constructor() {
    // Production-ready: No mock data initialization
    this.campaigns = []
    this.submissions = []
  }

  // Add a new campaign
  async addCampaign(campaign: Campaign): Promise<Campaign> {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create campaign: ${response.status}`)
      }
      
      const newCampaign = await response.json()
      this.campaigns.push(newCampaign)
      return newCampaign
    } catch (error) {
      console.error('Error creating campaign:', error)
      // Fallback to local storage
      this.campaigns.push(campaign)
      return campaign
    }
  }

  // Update an existing campaign
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update campaign: ${response.status}`)
      }
      
      const updatedCampaign = await response.json()
      const index = this.campaigns.findIndex(c => c.id === id)
      if (index !== -1) {
        this.campaigns[index] = updatedCampaign
      }
      return updatedCampaign
    } catch (error) {
      console.error('Error updating campaign:', error)
      // Fallback to local update
      const index = this.campaigns.findIndex(c => c.id === id)
      if (index === -1) return null
      
      this.campaigns[index] = { ...this.campaigns[index], ...updates, updatedAt: new Date() }
      return this.campaigns[index]
    }
  }

  // Get all campaigns
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.status}`)
      }
      
      const campaigns = await response.json()
      this.campaigns = campaigns
      return campaigns
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      // Fallback to local data if API fails
      return [...this.campaigns]
    }
  }

  // Get active campaigns only
  async getActiveCampaigns(): Promise<Campaign[]> {
    return this.campaigns.filter(campaign => campaign.status === 'active')
  }

  // Get campaign by ID
  async getCampaignById(id: string): Promise<Campaign | null> {
    return this.campaigns.find(campaign => campaign.id === id) || null
  }

  // Check if campaign is active and accepting uploads
  async canUploadToCampaign(campaignId: string): Promise<{
    canUpload: boolean
    reason?: string
    campaign?: Campaign
  }> {
    const campaign = await this.getCampaignById(campaignId)
    
    if (!campaign) {
      return { canUpload: false, reason: 'Campaign not found' }
    }

    if (campaign.status !== 'active') {
      return { 
        canUpload: false, 
        reason: `Campaign is ${campaign.status}. Only active campaigns accept uploads.`,
        campaign 
      }
    }

    const now = new Date()
    if (now < campaign.startDate) {
      return { 
        canUpload: false, 
        reason: 'Campaign has not started yet',
        campaign 
      }
    }

    if (now > campaign.endDate) {
      return { 
        canUpload: false, 
        reason: 'Campaign has ended',
        campaign 
      }
    }

    return { canUpload: true, campaign }
  }

  // Submit content to campaign
  async submitToCampaign(
    campaignId: string,
    userId: string,
    submission: Omit<CampaignSubmission, 'id' | 'campaignId' | 'userId' | 'submittedAt' | 'status'> & { uploadType?: 'file' | 'link' }
  ): Promise<CampaignSubmission> {
    try {
      const { canUpload, reason, campaign } = await this.canUploadToCampaign(campaignId)
      
      if (!canUpload) {
        throw new Error(`Cannot upload to campaign: ${reason}`)
      }

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      // Check if user has reached upload limit
      const userSubmissions = this.submissions.filter(
        sub => sub.campaignId === campaignId && sub.userId === userId
      )
      
      if (userSubmissions.length >= campaign.maxUploadsPerUser) {
        throw new Error(`Upload limit reached. Maximum ${campaign.maxUploadsPerUser} uploads allowed.`)
      }

      // Check content type is allowed
      if (!campaign.allowedContentTypes.includes(submission.contentType)) {
        throw new Error(`Content type '${submission.contentType}' not allowed for this campaign`)
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          userId,
          ...submission,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to submit content: ${response.status}`)
      }
      
      const newSubmission = await response.json()
      this.submissions.push(newSubmission)
      return newSubmission
    } catch (error) {
      console.error('Error submitting content:', error)
      // Fallback to local submission
      const newSubmission: CampaignSubmission = {
        id: `submission-${Date.now()}`,
        campaignId,
        userId,
        ...submission,
        submittedAt: new Date(),
        status: 'pending'
      }

      this.submissions.push(newSubmission)
      return newSubmission
    }
  }

  // Get all submissions across all campaigns
  async getAllSubmissions(): Promise<CampaignSubmission[]> {
    try {
      const response = await fetch('/api/submissions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.status}`)
      }
      
      const submissions = await response.json()
      this.submissions = submissions
      return submissions
    } catch (error) {
      console.error('Error fetching submissions:', error)
      // Fallback to local data
      return [...this.submissions]
    }
  }

  // Get user's submissions for a campaign
  async getUserSubmissions(campaignId: string, userId: string): Promise<CampaignSubmission[]> {
    return this.submissions.filter(
      sub => sub.campaignId === campaignId && sub.userId === userId
    )
  }

  // Approve a submission
  async approveSubmission(submissionId: string, data: { rewardEarned: number }): Promise<CampaignSubmission> {
    try {
      const response = await fetch(`/api/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to approve submission: ${response.status}`)
      }
      
      const updatedSubmission = await response.json()
      const index = this.submissions.findIndex(sub => sub.id === submissionId)
      if (index !== -1) {
        this.submissions[index] = updatedSubmission
      }
      return updatedSubmission
    } catch (error) {
      console.error('Error approving submission:', error)
      // Fallback to local update
      const submission = this.submissions.find(sub => sub.id === submissionId)
      if (!submission) {
        throw new Error('Submission not found')
      }

      submission.status = 'approved'
      submission.reviewedAt = new Date()
      submission.rewardEarned = data.rewardEarned
      submission.rejectionReason = null

      return submission
    }
  }

  // Reject a submission
  async rejectSubmission(submissionId: string, reason: string): Promise<CampaignSubmission> {
    try {
      const response = await fetch(`/api/submissions/${submissionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to reject submission: ${response.status}`)
      }
      
      const updatedSubmission = await response.json()
      const index = this.submissions.findIndex(sub => sub.id === submissionId)
      if (index !== -1) {
        this.submissions[index] = updatedSubmission
      }
      return updatedSubmission
    } catch (error) {
      console.error('Error rejecting submission:', error)
      // Fallback to local update
      const submission = this.submissions.find(sub => sub.id === submissionId)
      if (!submission) {
        throw new Error('Submission not found')
      }

      submission.status = 'rejected'
      submission.reviewedAt = new Date()
      submission.rejectionReason = reason
      submission.rewardEarned = undefined

      return submission
    }
  }

  // Get campaign statistics
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch campaign stats: ${response.status}`)
      }
      
      const stats = await response.json()
      return stats
    } catch (error) {
      console.error('Error fetching campaign stats:', error)
      // Fallback to local calculation
      const campaignSubmissions = this.submissions.filter(sub => sub.campaignId === campaignId)
      
      const stats: CampaignStats = {
        campaignId,
        totalSubmissions: campaignSubmissions.length,
        approvedSubmissions: campaignSubmissions.filter(sub => sub.status === 'approved').length,
        rejectedSubmissions: campaignSubmissions.filter(sub => sub.status === 'rejected').length,
        pendingSubmissions: campaignSubmissions.filter(sub => sub.status === 'pending').length,
        totalRewardsDistributed: campaignSubmissions
          .filter(sub => sub.status === 'approved')
          .reduce((sum, sub) => sum + (sub.rewardEarned || 0), 0),
        averageApprovalTime: 0, // Would calculate based on review times
        topContributors: []
      }

      // Calculate top contributors
      const contributorMap = new Map<string, { count: number; rewards: number; username: string }>()
      
      campaignSubmissions.forEach(sub => {
        if (sub.status === 'approved') {
          const existing = contributorMap.get(sub.userId) || { count: 0, rewards: 0, username: sub.userId }
          contributorMap.set(sub.userId, {
            count: existing.count + 1,
            rewards: existing.rewards + (sub.rewardEarned || 0),
            username: existing.username
          })
        }
      })

      stats.topContributors = Array.from(contributorMap.entries())
        .map(([userId, data]) => ({
          userId,
          username: data.username,
          submissionsCount: data.count,
          rewardsEarned: data.rewards
        }))
        .sort((a, b) => b.rewardsEarned - a.rewardsEarned)
        .slice(0, 5)

      return stats
    }
  }

  // Approve/reject submission (for admin use)
  async reviewSubmission(
    submissionId: string,
    reviewerId: string,
    status: 'approved' | 'rejected',
    feedback?: string
  ): Promise<CampaignSubmission> {
    const submission = this.submissions.find(sub => sub.id === submissionId)
    
    if (!submission) {
      throw new Error('Submission not found')
    }

    const campaign = await this.getCampaignById(submission.campaignId)
    if (!campaign) {
      throw new Error('Campaign not found')
    }

    submission.status = status
    submission.reviewedAt = new Date()
    submission.reviewerId = reviewerId
    submission.feedback = feedback

    if (status === 'approved') {
      submission.rewardEarned = campaign.rewardPerUpload
    }

    return submission
  }
}

export const campaignService = new CampaignService()
