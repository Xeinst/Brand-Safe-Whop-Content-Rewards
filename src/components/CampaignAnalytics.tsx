import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { campaignService } from '../services/campaignService'
import { Campaign, CampaignStats } from '../types/campaign'
import { 
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'

export function CampaignAnalytics() {
  const { } = useWhopSDK()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaignStats, setCampaignStats] = useState<CampaignStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const campaignsData = await campaignService.getCampaigns()
        setCampaigns(campaignsData)
        
        // Load stats for each campaign
        const statsPromises = campaignsData.map(campaign => 
          campaignService.getCampaignStats(campaign.id)
        )
        const stats = await Promise.all(statsPromises)
        setCampaignStats(stats)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getOverallStats = () => {
    const totalSubmissions = campaignStats.reduce((sum, stat) => sum + stat.totalSubmissions, 0)
    const totalApproved = campaignStats.reduce((sum, stat) => sum + stat.approvedSubmissions, 0)
    const totalRewards = campaignStats.reduce((sum, stat) => sum + stat.totalRewardsDistributed, 0)
    const approvalRate = totalSubmissions > 0 ? Math.round((totalApproved / totalSubmissions) * 100) : 0

    return {
      totalSubmissions,
      totalApproved,
      totalRewards,
      approvalRate
    }
  }

  const overallStats = getOverallStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whop-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-whop-primary">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Campaign Analytics</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalApproved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalRewards} pts</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <PieChart className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.approvalRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Campaign Performance</h2>
          </div>
          <div className="p-6">
            {campaigns.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns available</h3>
                <p className="text-gray-600">Create campaigns to start tracking performance analytics.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {campaigns.map((campaign, index) => {
                  const stats = campaignStats[index]
                  if (!stats) return null

                  const approvalRate = stats.totalSubmissions > 0 
                    ? Math.round((stats.approvedSubmissions / stats.totalSubmissions) * 100) 
                    : 0

                  return (
                    <div key={campaign.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                          <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Active Campaign</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>{campaign.rewardPerUpload} pts per upload</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-whop-primary">{approvalRate}%</div>
                          <div className="text-sm text-gray-500">Approval Rate</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</div>
                          <div className="text-sm text-gray-600">Total Submissions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.approvedSubmissions}</div>
                          <div className="text-sm text-gray-600">Approved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{stats.rejectedSubmissions}</div>
                          <div className="text-sm text-gray-600">Rejected</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{stats.pendingSubmissions}</div>
                          <div className="text-sm text-gray-600">Pending</div>
                        </div>
                      </div>
                      
                      {stats.topContributors.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Top Contributors</h4>
                          <div className="space-y-2">
                            {stats.topContributors.slice(0, 3).map((contributor, idx) => (
                              <div key={contributor.userId} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-whop-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {idx + 1}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">
                                    User {contributor.userId.slice(-4)}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {contributor.submissionsCount} submissions • {contributor.rewardsEarned} pts
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Trends</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Submissions</span>
                <span className="font-semibold text-gray-900">{overallStats.totalSubmissions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approval Rate</span>
                <span className="font-semibold text-green-600">{overallStats.approvalRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Review Time</span>
                <span className="font-semibold text-gray-900">2.5 hours</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reward Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Rewards Distributed</span>
                <span className="font-semibold text-gray-900">{overallStats.totalRewards} pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Reward</span>
                <span className="font-semibold text-gray-900">
                  {overallStats.totalApproved > 0 ? Math.round(overallStats.totalRewards / overallStats.totalApproved) : 0} pts
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Campaigns</span>
                <span className="font-semibold text-gray-900">{campaigns.filter(c => c.status === 'active').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}