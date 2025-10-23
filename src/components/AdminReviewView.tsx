import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, Clock, User, AlertTriangle } from 'lucide-react'
import { useWhopSDK } from '../lib/whop-sdk'

interface ReviewSubmission {
  id: string
  title: string
  description: string
  private_video_link: string
  thumbnail_url: string
  platform: string
  status: string
  visibility: string
  mod_verdict?: string
  mod_score?: number
  unsafe_reasons?: string[]
  submission_date: string
  username: string
  display_name: string
  avatar_url?: string
  reward_name: string
  cpm: number
}

export function AdminReviewView() {
  const sdk = useWhopSDK()
  const [submissions, setSubmissions] = useState<ReviewSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<ReviewSubmission | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    const loadReviewQueue = async () => {
      if (!sdk) return
      
      setLoading(true)
      try {
        const response = await fetch('/api/admin/review-queue')
        if (!response.ok) throw new Error('Failed to load review queue')
        const data = await response.json()
        setSubmissions(data)
      } catch (error) {
        console.error('Error loading review queue:', error)
        setSubmissions([])
      } finally {
        setLoading(false)
      }
    }

    loadReviewQueue()
  }, [sdk])

  const handleApprove = async (submission: ReviewSubmission) => {
    if (!sdk) return
    
    setProcessing(submission.id)
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewed_by: sdk.user?.id,
          review_note: reviewNote
        })
      })

      if (!response.ok) throw new Error('Failed to approve submission')

      // Remove from queue
      setSubmissions(prev => prev.filter(s => s.id !== submission.id))
      setSelectedSubmission(null)
      setReviewNote('')
    } catch (error) {
      console.error('Error approving submission:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (submission: ReviewSubmission) => {
    if (!sdk || !rejectionReason.trim()) return
    
    setProcessing(submission.id)
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewed_by: sdk.user?.id,
          note: rejectionReason
        })
      })

      if (!response.ok) throw new Error('Failed to reject submission')

      // Remove from queue
      setSubmissions(prev => prev.filter(s => s.id !== submission.id))
      setSelectedSubmission(null)
      setRejectionReason('')
      setShowRejectionModal(false)
    } catch (error) {
      console.error('Error rejecting submission:', error)
    } finally {
      setProcessing(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800'
      case 'flagged': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review': return <Clock className="w-4 h-4" />
      case 'flagged': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading review queue...</div>
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
              <h1 className="text-xl font-semibold">Content Review Queue</h1>
            </div>
            <div className="text-sm text-gray-400">
              {submissions.length} submissions pending review
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
            <p className="text-gray-400">No submissions pending review.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={submission.thumbnail_url || 'https://via.placeholder.com/120x68'}
                      alt={submission.title}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1">{submission.status.replace('_', ' ')}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{submission.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{submission.description}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{submission.display_name || submission.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(submission.submission_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>${submission.cpm}/1000 views</span>
                      </div>
                    </div>

                    {submission.unsafe_reasons && submission.unsafe_reasons.length > 0 && (
                      <div className="mt-3 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                        <div className="flex items-center space-x-2 text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Moderation Issues:</span>
                        </div>
                        <ul className="mt-2 text-sm text-red-300">
                          {submission.unsafe_reasons.map((reason, index) => (
                            <li key={index}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col space-y-2">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
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
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Review Submission</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white mb-2">{selectedSubmission.title}</h3>
                  <p className="text-gray-400 text-sm">{selectedSubmission.description}</p>
                </div>

                <div className="flex space-x-4">
                  <img
                    src={selectedSubmission.thumbnail_url || 'https://via.placeholder.com/200x120'}
                    alt={selectedSubmission.title}
                    className="w-48 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-400">Creator:</span> {selectedSubmission.display_name || selectedSubmission.username}</div>
                      <div><span className="text-gray-400">Platform:</span> {selectedSubmission.platform}</div>
                      <div><span className="text-gray-400">CPM:</span> ${selectedSubmission.cpm}/1000 views</div>
                      <div><span className="text-gray-400">Submitted:</span> {new Date(selectedSubmission.submission_date).toLocaleString()}</div>
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
                    onClick={() => handleApprove(selectedSubmission)}
                    disabled={processing === selectedSubmission.id}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {processing === selectedSubmission.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setShowRejectionModal(true)}
                    disabled={processing === selectedSubmission.id}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
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

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Reject Submission</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={4}
                    placeholder="Please explain why this submission is being rejected..."
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRejectionModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission!)}
                    disabled={!rejectionReason.trim() || processing === selectedSubmission?.id}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {processing === selectedSubmission?.id ? 'Rejecting...' : 'Reject'}
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
