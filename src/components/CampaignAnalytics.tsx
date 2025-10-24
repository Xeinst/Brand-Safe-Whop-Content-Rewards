import { useState, useEffect } from 'react'
import { campaignService } from '../services/campaignService'
import { Campaign, CampaignStats } from '../types/campaign'
import { 
  TrendingUp, 
  DollarSign, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  Calendar,
  Award,
  ArrowLeft
} from 'lucide-react'

export function CampaignAnalytics() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const allCampaigns = await campaignService.getCampaigns()
        setCampaigns(allCampaigns)
        
        if (allCampaigns.length > 0) {
          setSelectedCampaign(allCampaigns[0])
          const stats = await campaignService.getCampaignStats(allCampaigns[0].id)
          setCampaignStats(stats)
        }
      } catch (error) {
        console.error('Failed to load campaign data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCampaignSelect = async (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    try {
      const stats = await campaignService.getCampaignStats(campaign.id)
      setCampaignStats(stats)
    } catch (error) {
      console.error('Failed to load campaign stats:', error)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whop-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/campaigns'}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Campaigns
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Campaign Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance and engagement across all campaigns</p>
        </div>
      </div>

      {/* Campaign Selector */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Campaign</h2>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaigns Available</h3>
              <p className="text-gray-600 mb-4">Create campaigns to start tracking analytics and performance.</p>
              <button
                onClick={() => window.location.href = '/campaigns'}
                className="px-4 py-2 bg-whop-primary text-white rounded-lg hover:bg-whop-secondary transition-colors"
              >
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => handleCampaignSelect(campaign)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCampaign?.id === campaign.id
                      ? 'border-whop-primary bg-whop-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campaign Stats */}
      {selectedCampaign && campaignStats && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{campaignStats.totalSubmissions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{campaignStats.approvedSubmissions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{campaignStats.rejectedSubmissions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{campaignStats.pendingSubmissions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Approval Rate */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Rate</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Overall Approval Rate</span>
                    <span>
                      {campaignStats.totalSubmissions > 0 
                        ? Math.round((campaignStats.approvedSubmissions / campaignStats.totalSubmissions) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${campaignStats.totalSubmissions > 0 
                          ? (campaignStats.approvedSubmissions / campaignStats.totalSubmissions) * 100
                          : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Rejection Rate</span>
                    <span>
                      {campaignStats.totalSubmissions > 0 
                        ? Math.round((campaignStats.rejectedSubmissions / campaignStats.totalSubmissions) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${campaignStats.totalSubmissions > 0 
                          ? (campaignStats.rejectedSubmissions / campaignStats.totalSubmissions) * 100
                          : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rewards Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Total Rewards Distributed</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {campaignStats.totalRewardsDistributed} pts
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Average Approval Time</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {campaignStats.averageApprovalTime}h
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
            {campaignStats.topContributors.length > 0 ? (
              <div className="space-y-3">
                {campaignStats.topContributors.map((contributor, index) => (
                  <div key={contributor.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-whop-primary rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contributor.username}</p>
                        <p className="text-sm text-gray-600">{contributor.submissionsCount} submissions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{contributor.rewardsEarned} pts</p>
                      <p className="text-sm text-gray-600">earned</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contributors yet</p>
                <p className="text-sm text-gray-500">Contributors will appear here once they start submitting content</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* No Campaign Selected */}
      {campaigns.length > 0 && !selectedCampaign && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaign Selected</h3>
          <p className="text-gray-600">Select a campaign from the list above to view its analytics</p>
        </div>
      )}
    </div>
  )
}
