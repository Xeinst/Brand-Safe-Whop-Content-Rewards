import { useState, useEffect } from 'react'
import { campaignService } from '../services/campaignService'
import { CampaignSubmission } from '../types/campaign'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Calendar,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search
} from 'lucide-react'

export function ContentApprovalWorkflow() {
  const [submissions, setSubmissions] = useState<CampaignSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<CampaignSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<CampaignSubmission | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true)
        const allSubmissions = await campaignService.getAllSubmissions()
        setSubmissions(allSubmissions)
        setFilteredSubmissions(allSubmissions)
      } catch (error) {
        console.error('Failed to load submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [])

  useEffect(() => {
    let filtered = submissions

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(sub => sub.status === filter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSubmissions(filtered)
  }, [submissions, filter, searchTerm])

  const handleApprove = async (submission: CampaignSubmission) => {
    try {
      await campaignService.approveSubmission(submission.id, {
        rewardEarned: Math.floor(Math.random() * 100) + 50 // Mock reward calculation
      })
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === submission.id 
          ? { ...sub, status: 'approved', reviewedAt: new Date(), rewardEarned: Math.floor(Math.random() * 100) + 50 }
          : sub
      ))
      
      setSelectedSubmission(null)
    } catch (error) {
      console.error('Failed to approve submission:', error)
    }
  }

  const handleReject = async (submission: CampaignSubmission, reason: string) => {
    try {
      await campaignService.rejectSubmission(submission.id, reason)
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === submission.id 
          ? { ...sub, status: 'rejected', reviewedAt: new Date(), rejectionReason: reason }
          : sub
      ))
      
      setSelectedSubmission(null)
    } catch (error) {
      console.error('Failed to reject submission:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-900">Content Approval Workflow</h1>
          <p className="text-gray-600 mt-1">Review and approve submitted content</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-whop-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-whop-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Submissions ({filteredSubmissions.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'No content has been submitted yet.'
                  : `No submissions with status "${filter}" found.`
                }
              </p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{submission.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status}</span>
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{submission.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>User {submission.userId.slice(-4)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Submitted {formatDate(submission.submittedAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="capitalize">{submission.contentType}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {submission.status === 'pending' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApprove(submission)
                          }}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const reason = prompt('Rejection reason:')
                            if (reason) handleReject(submission, reason)
                          }}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <ThumbsDown className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedSubmission(submission)
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedSubmission.title}</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Content Preview */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Content Preview</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {selectedSubmission.contentType === 'image' ? (
                    <img 
                      src={selectedSubmission.contentUrl} 
                      alt={selectedSubmission.title}
                      className="max-w-full h-auto rounded-lg"
                    />
                  ) : selectedSubmission.contentType === 'video' ? (
                    <video 
                      src={selectedSubmission.contentUrl} 
                      controls
                      className="max-w-full h-auto rounded-lg"
                    />
                  ) : (
                    <div className="p-4 text-center text-gray-600">
                      <p>Text content: {selectedSubmission.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submission Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                    {getStatusIcon(selectedSubmission.status)}
                    <span className="ml-1 capitalize">{selectedSubmission.status}</span>
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Content Type</h4>
                  <p className="text-gray-600 capitalize">{selectedSubmission.contentType}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Submitted By</h4>
                  <p className="text-gray-600">User {selectedSubmission.userId.slice(-4)}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Submitted At</h4>
                  <p className="text-gray-600">{formatDate(selectedSubmission.submittedAt)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Description</h4>
                <p className="text-gray-600">{selectedSubmission.description}</p>
              </div>

              {/* Rejection Reason */}
              {selectedSubmission.rejectionReason && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Rejection Reason</h4>
                  <p className="text-red-600">{selectedSubmission.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              {selectedSubmission.status === 'pending' && (
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedSubmission)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:')
                      if (reason) handleReject(selectedSubmission, reason)
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
