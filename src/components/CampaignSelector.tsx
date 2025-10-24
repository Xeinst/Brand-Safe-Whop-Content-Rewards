import { useState, useEffect } from 'react'
import { campaignService } from '../services/campaignService'
import { Campaign } from '../types/campaign'
import { Calendar, Users, Award, Clock, CheckCircle, XCircle } from 'lucide-react'

interface CampaignSelectorProps {
  onCampaignSelect: (campaign: Campaign) => void
  onClose: () => void
}

export function CampaignSelector({ onCampaignSelect, onClose }: CampaignSelectorProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true)
        const activeCampaigns = await campaignService.getActiveCampaigns()
        setCampaigns(activeCampaigns)
      } catch (err) {
        setError('Failed to load campaigns')
        console.error('Error loading campaigns:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCampaigns()
  }, [])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'inactive':
        return <XCircle className="w-4 h-4" />
      case 'completed':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whop-primary"></div>
            <span className="ml-3 text-gray-600">Loading campaigns...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Campaigns</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Campaigns</h3>
            <p className="text-gray-600 mb-4">
              There are currently no active campaigns accepting uploads.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Select Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Choose an active campaign to upload your content to. Only active campaigns accept new uploads.
        </p>

        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-whop-primary cursor-pointer transition-colors"
              onClick={() => onCampaignSelect(campaign)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900 mr-3">
                      {campaign.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1 capitalize">{campaign.status}</span>
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{campaign.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      <span>{campaign.rewardPerUpload} points per upload</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Max {campaign.maxUploadsPerUser} uploads</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <button className="px-4 py-2 bg-whop-primary text-white rounded hover:bg-whop-primary/90">
                    Select
                  </button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  <strong>Allowed content types:</strong>{' '}
                  {campaign.allowedContentTypes.join(', ')}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  <strong>Brand guidelines:</strong>{' '}
                  {campaign.brandGuidelines.join('; ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
