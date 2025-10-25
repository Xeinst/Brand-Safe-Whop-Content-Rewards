import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { campaignService } from '../services/campaignService'
import { Campaign } from '../types/campaign'
import { 
  Button,
  EmptyState
} from '@whop/frosted-ui'
import { 
  Upload, 
  DollarSign
} from 'lucide-react'
import { CampaignSelector } from './CampaignSelector'
import { ContentUpload } from './ContentUpload'

export function ContentSubmissionView() {
  const { } = useWhopSDK()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCampaignSelector, setShowCampaignSelector] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const campaignsData = await campaignService.getCampaigns()
        
        // Filter active campaigns only
        const activeCampaigns = campaignsData.filter(c => c.status === 'active')
        setCampaigns(activeCampaigns)
      } catch (error) {
        console.error('Failed to load campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowCampaignSelector(false)
    setShowUpload(true)
  }

  const handleUploadSuccess = () => {
    setShowUpload(false)
    setSelectedCampaign(null)
    // Reload campaigns to show updated data
    loadData()
  }

  const handleUploadClose = () => {
    setShowUpload(false)
    setSelectedCampaign(null)
  }

  const loadData = async () => {
    try {
      const campaignsData = await campaignService.getCampaigns()
      const activeCampaigns = campaignsData.filter(c => c.status === 'active')
      setCampaigns(activeCampaigns)
    } catch (error) {
      console.error('Failed to load campaigns:', error)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-whop-primary">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Submit Content</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowCampaignSelector(true)}
                variant="primary"
                size="md"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Content
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {campaigns.length === 0 ? (
          <EmptyState
            title="No active campaigns"
            description="Check back later for new campaigns to participate in."
          />
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Content</h2>
              <p className="text-gray-600 mb-6">Choose a campaign to upload your content to.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => handleCampaignSelect(campaign)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-whop-primary hover:shadow-md transition-all cursor-pointer"
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{campaign.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-green-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{campaign.rewardPerUpload} points</span>
                      </div>
                      <button className="text-whop-primary hover:text-whop-secondary text-sm font-medium">
                        Select →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Selector Modal */}
      {showCampaignSelector && (
        <CampaignSelector
          onCampaignSelect={handleCampaignSelect}
          onClose={() => setShowCampaignSelector(false)}
        />
      )}

      {/* Content Upload Modal */}
      {showUpload && selectedCampaign && (
        <ContentUpload
          campaign={selectedCampaign}
          onClose={handleUploadClose}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}