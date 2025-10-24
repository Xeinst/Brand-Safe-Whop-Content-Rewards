export interface Campaign {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'draft' | 'completed'
  startDate: Date
  endDate: Date
  brandGuidelines: string[]
  rewardPerUpload: number
  maxUploadsPerUser: number
  allowedContentTypes: ('image' | 'video' | 'text')[]
  companyId: string
  createdAt: Date
  updatedAt: Date
}

export interface CampaignSubmission {
  id: string
  campaignId: string
  userId: string
  contentUrl: string
  fileUrl: string
  contentType: 'image' | 'video' | 'text'
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  submittedAt: Date
  reviewedAt?: Date
  reviewerId?: string
  feedback?: string
  rejectionReason?: string | null
  rewardEarned?: number
}

export interface CampaignStats {
  campaignId: string
  totalSubmissions: number
  approvedSubmissions: number
  rejectedSubmissions: number
  pendingSubmissions: number
  totalRewardsDistributed: number
  averageApprovalTime: number
  topContributors: Array<{
    userId: string
    username: string
    submissionsCount: number
    rewardsEarned: number
  }>
}
