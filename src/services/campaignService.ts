import { Campaign, CampaignSubmission, CampaignStats } from '../types/campaign'

export class CampaignService {
  private campaigns: Campaign[] = []
  private submissions: CampaignSubmission[] = []

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Initialize with sample data for demonstration
    this.campaigns = [
      {
        id: 'campaign-1',
        name: 'Brand Safe Content',
        description: 'Submit brand-safe content for approval and earn rewards',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        brandGuidelines: [
          'No inappropriate content',
          'Must align with brand values',
          'High quality production',
          'Original content only'
        ],
        rewardPerUpload: 50,
        maxUploadsPerUser: 10,
        allowedContentTypes: ['image', 'video'],
        companyId: 'demo-company-1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'campaign-2',
        name: 'Educational Content',
        description: 'Create educational content about our products and services',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        brandGuidelines: [
          'Educational and informative',
          'Professional presentation',
          'Accurate information',
          'Engaging content'
        ],
        rewardPerUpload: 75,
        maxUploadsPerUser: 5,
        allowedContentTypes: ['video', 'text'],
        companyId: 'demo-company-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    this.submissions = [
      {
        id: 'submission-1',
        campaignId: 'campaign-1',
        userId: 'current-user-id',
        contentUrl: 'https://example.com/video1',
        fileUrl: 'https://example.com/video1',
        contentType: 'video',
        title: 'Product Demo Video',
        description: 'A comprehensive demo of our latest product features',
        status: 'approved',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        reviewerId: 'admin-1',
        feedback: 'Great content! Approved for publication.',
        rewardEarned: 50
      },
      {
        id: 'submission-2',
        campaignId: 'campaign-1',
        userId: 'current-user-id',
        contentUrl: 'https://example.com/image1',
        fileUrl: 'https://example.com/image1',
        contentType: 'image',
        title: 'Brand Lifestyle Image',
        description: 'Lifestyle image showcasing our brand values',
        status: 'pending',
        submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        rewardEarned: undefined
      },
      {
        id: 'submission-3',
        campaignId: 'campaign-2',
        userId: 'current-user-id',
        contentUrl: 'https://example.com/educational',
        fileUrl: 'https://example.com/educational',
        contentType: 'video',
        title: 'How-to Guide',
        description: 'Step-by-step guide on using our platform',
        status: 'rejected',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        reviewerId: 'admin-1',
        feedback: 'Content needs better lighting and clearer audio.',
        rejectionReason: 'Quality issues - poor lighting and audio',
        rewardEarned: undefined
      }
    ]
  }

  // Add a new campaign
  addCampaign(campaign: Campaign): void {
    this.campaigns.push(campaign)
  }

  // Update an existing campaign
  updateCampaign(id: string, updates: Partial<Campaign>): Campaign | null {
    const index = this.campaigns.findIndex(c => c.id === id)
    if (index === -1) return null
    
    this.campaigns[index] = { ...this.campaigns[index], ...updates, updatedAt: new Date() }
    return this.campaigns[index]
  }

  // Get all campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return [...this.campaigns]
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
    submission: Omit<CampaignSubmission, 'id' | 'campaignId' | 'userId' | 'submittedAt' | 'status'>
  ): Promise<CampaignSubmission> {
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

  // Get all submissions across all campaigns
  async getAllSubmissions(): Promise<CampaignSubmission[]> {
    return [...this.submissions]
  }

  // Get user's submissions for a campaign
  async getUserSubmissions(campaignId: string, userId: string): Promise<CampaignSubmission[]> {
    return this.submissions.filter(
      sub => sub.campaignId === campaignId && sub.userId === userId
    )
  }

  // Approve a submission
  async approveSubmission(submissionId: string, data: { rewardEarned: number }): Promise<CampaignSubmission> {
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

  // Reject a submission
  async rejectSubmission(submissionId: string, reason: string): Promise<CampaignSubmission> {
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

  // Get campaign statistics
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
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
