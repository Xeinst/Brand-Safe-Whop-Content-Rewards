import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, Clock, User, DollarSign, ThumbsUp, MessageSquare } from 'lucide-react'
import { useWhopSDK, Submission } from '../lib/whop-sdk'

export function BrandModerationView() {
  const sdk = useWhopSDK()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!sdk) return
      
      setLoading(true)
      try {
        const data = await sdk.getSubmissions()
        setSubmissions(data)
      } catch (error) {
        console.error('Error loading submissions:', error)
        setSubmissions([])
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [sdk])

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true
    if (filter === 'pending') return submission.status === 'pending_approval'
    if (filter === 'approved') return submission.status === 'approved'
    if (filter === 'rejected') return submission.status === 'rejected'
    return true
  })

  const handleApprove = async (submission: Submission) => {
    if (!sdk) return
    
    try {
      await sdk.approveSubmission(submission.id)
      setSubmissions(prev => prev.map(s => 
        s.id === submission.id ? { ...s, status: 'approved' as const } : s
      ))
      setSelectedSubmission(null)
    } catch (error) {
      console.error('Error approving submission:', error)
    }
  }

  const handleReject = async (submission: Submission) => {
    if (!sdk || !rejectionReason) return
    
    try {
      await sdk.rejectSubmission(submission.id, rejectionReason)
      setSubmissions(prev => prev.map(s => 
        s.id === submission.id ? { ...s, status: 'rejected' as const } : s
      ))
      setShowRejectionModal(false)
      setSelectedSubmission(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting submission:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending_approval':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900/20 text-green-400 border-green-500'
      case 'rejected':
        return 'bg-red-900/20 text-red-400 border-red-500'
      case 'pending_approval':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-500'
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading submissions...</div>
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
              <h1 className="text-xl font-semibold">Content Moderation</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {filteredSubmissions.length} submissions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'pending', label: 'Pending Review', count: submissions.filter(s => s.status === 'pending_approval').length },
              { key: 'approved', label: 'Approved', count: submissions.filter(s => s.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: submissions.filter(s => s.status === 'rejected').length },
              { key: 'all', label: 'All', count: submissions.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filter === tab.key
                    ? 'text-white border-whop-dragon-fire'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No submissions found</h3>
            <p className="text-gray-400">No content submissions match your current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submissions List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredSubmissions.map(submission => (
                <div
                  key={submission.id}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(submission.status)}
                        <h3 className="text-lg font-semibold text-white">{submission.content.title}</h3>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">No description provided</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{submission.user}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{submission.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{submission.likes.toLocaleString()} likes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{submission.paid ? 'Paid' : 'Unpaid'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                      {submission.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submission Details */}
            {selectedSubmission && (
              <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-6">
                  <h3 className="text-lg font-semibold mb-4">Submission Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Title</label>
                      <p className="text-white font-medium">{selectedSubmission.content.title}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400">Creator</label>
                      <p className="text-white">{selectedSubmission.user}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400">Platform</label>
                      <p className="text-white capitalize">{selectedSubmission.content.platform}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400">Views</label>
                      <p className="text-white">{selectedSubmission.views.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400">Likes</label>
                      <p className="text-white">{selectedSubmission.likes.toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedSubmission.status)}`}>
                        {getStatusIcon(selectedSubmission.status)}
                        <span className="ml-1">{selectedSubmission.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    
                    {selectedSubmission.status === 'pending_approval' && (
                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={() => handleApprove(selectedSubmission)}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => setShowRejectionModal(true)}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Submission</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Reason for rejection</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
                rows={4}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedSubmission)}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}