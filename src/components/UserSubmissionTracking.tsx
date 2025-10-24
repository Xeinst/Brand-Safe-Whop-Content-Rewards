import { useState, useEffect } from 'react'
import { campaignService } from '../services/campaignService'
import { CampaignSubmission, Campaign } from '../types/campaign'
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  Award,
  Eye,
  Filter,
  Search,
  DollarSign
} from 'lucide-react'

export function UserSubmissionTracking() {
  const [submissions, setSubmissions] = useState<CampaignSubmission[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<CampaignSubmission | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [totalEarnings, setTotalEarnings] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load campaigns and submissions
        const [campaignsData, submissionsData] = await Promise.all([
          campaignService.getCampaigns(),
          campaignService.getAllSubmissions()
        ])
        
        setCampaigns(campaignsData)
        
        // Filter submissions for current user (in real app, get from SDK)
        const userSubmissions = submissionsData.filter((sub: CampaignSubmission) => sub.userId === 'current-user-id')
        setSubmissions(userSubmissions)
        
        // Calculate total earnings
        const earnings = userSubmissions
          .filter((sub: CampaignSubmission) => sub.status === 'approved')
          .reduce((sum: number, sub: CampaignSubmission) => sum + (sub.rewardEarned || 0), 0)
        setTotalEarnings(earnings)
        
      } catch (error) {
        console.error('Failed to load submission data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    return campaign?.name || 'Unknown Campaign'
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

  const filteredSubmissions = submissions.filter(submission => {
    const matchesFilter = filter === 'all' || submission.status === filter
    const matchesSearch = searchTerm === '' || 
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCampaignName(submission.campaignId).toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    approvalRate: submissions.length > 0 ? Math.round((submissions.filter(s => s.status === 'approved').length / submissions.length) * 100) : 0
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
          <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
          <p className="text-gray-600 mt-1">Track your content submissions and earnings</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{totalEarnings} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Rate */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Rate</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall Approval Rate</span>
              <span>{stats.approvalRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.approvalRate}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{stats.approved} approved</p>
            <p className="text-sm text-gray-600">out of {stats.total} total</p>
          </div>
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
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? "You haven't submitted any content yet."
                  : `No submissions with status "${filter}" found.`
                }
              </p>
              <button
                onClick={() => window.location.href = '/experiences'}
                className="px-4 py-2 bg-whop-primary text-white rounded-lg hover:bg-whop-secondary transition-colors"
              >
                Submit Content
              </button>
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
                        <Award className="w-4 h-4 mr-1" />
                        <span>{getCampaignName(submission.campaignId)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Submitted {formatDate(submission.submittedAt)}</span>
                      </div>
                      {submission.rewardEarned && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="text-green-600 font-medium">{submission.rewardEarned} pts earned</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
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
                  <h4 className="font-medium text-gray-900 mb-1">Campaign</h4>
                  <p className="text-gray-600">{getCampaignName(selectedSubmission.campaignId)}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Content Type</h4>
                  <p className="text-gray-600 capitalize">{selectedSubmission.contentType}</p>
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

              {/* Reward Information */}
              {selectedSubmission.rewardEarned && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-1">Reward Earned</h4>
                  <p className="text-green-800 font-semibold">{selectedSubmission.rewardEarned} points</p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedSubmission.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-1">Rejection Reason</h4>
                  <p className="text-red-800">{selectedSubmission.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
