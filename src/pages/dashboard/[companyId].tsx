import { useState, useEffect } from 'react'
import { Plus, Play, Pause, Edit, Eye, CheckCircle, XCircle } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  advertiser_id: string
  cpm_cents: number
  budget_cents: number
  start_at: string
  end_at: string | null
  active: boolean
  submission_count: number
  total_views: number
  total_spend_cents: number
}

interface ReviewSubmission {
  id: string
  title: string
  description: string
  storage_key: string
  thumb_key: string
  status: string
  visibility: string
  created_at: string
  username: string
  display_name: string
  campaign_name: string
  cpm_cents: number
}

export default function OwnerDashboard() {
  // Get companyId from URL path
  const companyId = window.location.pathname.split('/')[2]
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [reviewQueue, setReviewQueue] = useState<ReviewSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<ReviewSubmission | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (companyId) {
      loadCampaigns()
      loadReviewQueue()
    }
  }, [companyId])

  const loadCampaigns = async () => {
    try {
      const response = await fetch(`/api/admin/campaigns?companyId=${companyId}`)
      if (!response.ok) throw new Error('Failed to load campaigns')
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      console.error('Error loading campaigns:', error)
    }
  }

  const loadReviewQueue = async () => {
    try {
      const response = await fetch('/api/admin/review-queue')
      if (!response.ok) throw new Error('Failed to load review queue')
      const data = await response.json()
      setReviewQueue(data)
    } catch (error) {
      console.error('Error loading review queue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/toggle`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to toggle campaign')
      await loadCampaigns()
    } catch (error) {
      console.error('Error toggling campaign:', error)
    }
  }

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNote })
      })
      if (!response.ok) throw new Error('Failed to approve submission')
      await loadReviewQueue()
      setSelectedSubmission(null)
      setReviewNote('')
    } catch (error) {
      console.error('Error approving submission:', error)
    }
  }

  const handleRejectSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: rejectionReason })
      })
      if (!response.ok) throw new Error('Failed to reject submission')
      await loadReviewQueue()
      setSelectedSubmission(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting submission:', error)
    }
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
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
              <h1 className="text-xl font-semibold">Campaign Dashboard</h1>
            </div>
            <button
              onClick={() => {/* TODO: Implement campaign creation modal */}}
              className="px-4 py-2 bg-whop-dragon-fire hover:bg-whop-dragon-fire/80 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaigns Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Campaigns</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">CPM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Spend</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{campaign.name}</div>
                      <div className="text-sm text-gray-400">{campaign.advertiser_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(campaign.cpm_cents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {campaign.budget_cents > 0 ? formatCurrency(campaign.budget_cents) : 'Unlimited'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        campaign.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {campaign.submission_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(campaign.total_spend_cents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleCampaign(campaign.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            campaign.active 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {campaign.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Queue Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Review Queue</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Creator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {reviewQueue.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-300">Thumb</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{submission.title}</div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">{submission.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {submission.display_name || submission.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {submission.campaign_name || 'No Campaign'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        submission.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                        submission.status === 'flagged' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {submission.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(submission.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Review Submission</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">{selectedSubmission.title}</h4>
                  <p className="text-gray-400 text-sm">{selectedSubmission.description}</p>
                </div>

                <div className="flex space-x-4">
                  <div className="w-48 h-32 bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-gray-300">Thumbnail</span>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Creator:</span> {selectedSubmission.display_name || selectedSubmission.username}</div>
                      <div><span className="text-gray-400">Campaign:</span> {selectedSubmission.campaign_name || 'No Campaign'}</div>
                      <div><span className="text-gray-400">CPM:</span> {formatCurrency(selectedSubmission.cpm_cents)}</div>
                      <div><span className="text-gray-400">Created:</span> {formatDate(selectedSubmission.created_at)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Review Note (Optional)
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
                    rows={3}
                    placeholder="Add a note about your review decision..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleApproveSubmission(selectedSubmission.id)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:')
                      if (reason) {
                        setRejectionReason(reason)
                        handleRejectSubmission(selectedSubmission.id)
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
