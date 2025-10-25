import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { campaignService } from '../services/campaignService'
import { CampaignSubmission } from '../types/campaign'
import { 
  CheckCircle, 
  Clock,
  Eye,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'

export function ContentApprovalWorkflow() {
  const { } = useWhopSDK()
  const [submissions, setSubmissions] = useState<CampaignSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<CampaignSubmission | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const submissionsData = await campaignService.getAllSubmissions()
        // Filter to show only pending submissions for review
        const pendingSubmissions = submissionsData.filter(s => s.status === 'pending')
        setSubmissions(pendingSubmissions)
      } catch (error) {
        console.error('Failed to load submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleReviewSubmission = (submission: CampaignSubmission) => {
    setSelectedSubmission(submission)
    setShowReviewModal(true)
  }

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      await campaignService.approveSubmission(submissionId, { 
        rewardEarned: 50
      })
      
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
      setShowReviewModal(false)
      setSelectedSubmission(null)
    } catch (error) {
      console.error('Failed to approve submission:', error)
    }
  }

  const handleRejectSubmission = async (submissionId: string, reason: string) => {
    try {
      await campaignService.rejectSubmission(submissionId, reason)
      
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
      setShowReviewModal(false)
      setSelectedSubmission(null)
    } catch (error) {
      console.error('Failed to reject submission:', error)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return '🎥'
      case 'image':
        return '🖼️'
      case 'text':
        return '📝'
      default:
        return '📄'
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
              <h1 className="text-xl font-semibold text-gray-900">Content Approval Workflow</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                {submissions.length} pending review
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No content submissions are pending review.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{getContentTypeIcon(submission.contentType)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{submission.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>User {submission.userId.slice(-4)}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Submitted {formatDate(submission.submittedAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="capitalize">{submission.contentType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{submission.description}</p>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Content URL:</span>
                        <a 
                          href={submission.contentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-whop-primary hover:text-whop-secondary text-sm"
                        >
                          View Content
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-6">
                    <button
                      onClick={() => handleReviewSubmission(submission)}
                      className="px-4 py-2 bg-whop-primary text-white rounded-lg hover:bg-whop-secondary transition-colors flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <ReviewModal
          submission={selectedSubmission}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedSubmission(null)
          }}
          onApprove={handleApproveSubmission}
          onReject={handleRejectSubmission}
        />
      )}
    </div>
  )
}

// Review Modal Component
function ReviewModal({ 
  submission, 
  onClose, 
  onApprove, 
  onReject 
}: { 
  submission: CampaignSubmission
  onClose: () => void
  onApprove: (id: string, feedback?: string) => void
  onReject: (id: string, reason: string) => void
}) {
  const [feedback, setFeedback] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(submission.id, feedback)
    } else if (action === 'reject') {
      onReject(submission.id, rejectionReason)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Review Content</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Content Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{submission.title}</h3>
            <p className="text-gray-600 mb-3">{submission.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Type: {submission.contentType}</span>
              <span>User: {submission.userId.slice(-4)}</span>
            </div>
            <div className="mt-3">
              <a 
                href={submission.contentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-whop-primary hover:text-whop-secondary text-sm"
              >
                View Content →
              </a>
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Review Decision</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setAction('approve')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  action === 'approve'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ThumbsUp className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Approve</div>
                    <div className="text-sm text-gray-600">Content meets guidelines</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setAction('reject')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  action === 'reject'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-red-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ThumbsDown className="w-6 h-6 text-red-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Reject</div>
                    <div className="text-sm text-gray-600">Content needs improvement</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Feedback/Reason Input */}
          {action && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {action === 'approve' ? 'Feedback (optional)' : 'Rejection Reason (required)'}
                </label>
                <textarea
                  value={action === 'approve' ? feedback : rejectionReason}
                  onChange={(e) => action === 'approve' ? setFeedback(e.target.value) : setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
                  rows={3}
                  placeholder={action === 'approve' ? 'Add feedback for the creator...' : 'Explain why this content was rejected...'}
                  required={action === 'reject'}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!action || (action === 'reject' && !rejectionReason.trim())}
              className="flex-1 px-4 py-2 bg-whop-primary text-white rounded-md hover:bg-whop-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action === 'approve' ? 'Approve Content' : 'Reject Content'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}