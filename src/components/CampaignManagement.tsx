import { useState, useEffect } from 'react'
import { Plus, Edit, Pause, Play, Eye, DollarSign, Users, TrendingUp } from 'lucide-react'
import { useWhopSDK, ContentReward } from '../lib/whop-sdk'

export function CampaignManagement() {
  const sdk = useWhopSDK()
  const [campaigns, setCampaigns] = useState<ContentReward[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<ContentReward | null>(null)

  useEffect(() => {
    const loadCampaigns = async () => {
      if (!sdk) return
      
      setLoading(true)
      try {
        const data = await sdk.getContentRewards()
        setCampaigns(data)
      } catch (error) {
        console.error('Error loading campaigns:', error)
        setCampaigns([])
      } finally {
        setLoading(false)
      }
    }

    loadCampaigns()
  }, [sdk])

  const handleCreateCampaign = async (campaignData: any) => {
    if (!sdk) return
    
    try {
      const newCampaign = await sdk.createContentReward(campaignData)
      setCampaigns(prev => [newCampaign, ...prev])
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  const handleUpdateCampaign = async (id: string, updates: any) => {
    if (!sdk) return
    
    try {
      const updatedCampaign = await sdk.updateContentReward(id, updates)
      setCampaigns(prev => prev.map(c => c.id === id ? updatedCampaign : c))
      setEditingCampaign(null)
    } catch (error) {
      console.error('Error updating campaign:', error)
    }
  }

  const handleToggleCampaign = async (campaign: ContentReward) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    await handleUpdateCampaign(campaign.id, { status: newStatus })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading campaigns...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-whop-dragon-fire">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold">Campaign Management</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/approval'}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Review Content</span>
              </button>
              <button
                onClick={() => window.location.href = '/campaigns/analytics'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-whop-dragon-fire hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campaign</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{campaign.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{campaign.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-white">${campaign.cpm}/CPM</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === 'active' 
                        ? 'bg-green-900/20 text-green-400' 
                        : 'bg-yellow-900/20 text-yellow-400'
                    }`}>
                      {campaign.status}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingCampaign(campaign)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleCampaign(campaign)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* Campaign Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{campaign.totalViews.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{campaign.approvedSubmissions}</div>
                  <div className="text-xs text-gray-400">Approved</div>
                </div>
              </div>
              
              {/* Campaign Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View Stats</span>
                </button>
                <button className="flex-1 px-3 py-2 bg-whop-dragon-fire hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>View Submissions</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No campaigns yet</h3>
            <p className="text-gray-400 mb-4">Create your first campaign to start rewarding content creators.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-whop-dragon-fire hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Create Campaign
            </button>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <CreateCampaignModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateCampaign}
        />
      )}

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSubmit={(updates) => handleUpdateCampaign(editingCampaign.id, updates)}
        />
      )}
    </div>
  )
}

// Create Campaign Modal Component
function CreateCampaignModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cpm: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Create Campaign</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Campaign Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">CPM Rate ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.cpm}
              onChange={(e) => setFormData(prev => ({ ...prev, cpm: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
              required
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-whop-dragon-fire hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Campaign Modal Component
function EditCampaignModal({ campaign, onClose, onSubmit }: { campaign: ContentReward; onClose: () => void; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description,
    cpm: campaign.cpm,
    status: campaign.status
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Edit Campaign</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Campaign Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">CPM Rate ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.cpm}
              onChange={(e) => setFormData(prev => ({ ...prev, cpm: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-whop-dragon-fire hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Update Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
