import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp,
  Shield,
  FileText,
  Video,
  Image,
} from 'lucide-react'

interface ContentSubmission {
  id: string
  title: string
  description: string
  type: 'video' | 'image' | 'text'
  url?: string
  creator: {
    id: string
    username: string
    avatar?: string
  }
  brandGuidelines: string[]
  estimatedCPM: number
  status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  submittedAt: Date
  reviewedAt?: Date
  reviewerNotes?: string
  brandSafetyScore?: number
  potentialIssues?: string[]
}

interface ModerationStats {
  totalSubmissions: number
  pendingReview: number
  approvedToday: number
  rejectedToday: number
  averageReviewTime: string
  brandSafetyScore: number
}

export function BrandModerationView() {
  const { company } = useWhopSDK()
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<ContentSubmission | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [stats, setStats] = useState<ModerationStats>({
    totalSubmissions: 0,
    pendingReview: 0,
    approvedToday: 0,
    rejectedToday: 0,
    averageReviewTime: '2.5 hours',
    brandSafetyScore: 94.2
  })

  useEffect(() => {
    // Load mock data
    const mockSubmissions: ContentSubmission[] = [
      {
        id: '1',
        title: 'Product Demo Video',
        description: 'A clean demonstration of our new product features with professional lighting and clear audio.',
        type: 'video',
        url: 'https://via.placeholder.com/400x300',
        creator: {
          id: 'creator-1',
          username: 'alice_creator',
          avatar: 'https://via.placeholder.com/40'
        },
        brandGuidelines: ['No profanity or offensive language', 'Must align with brand values', 'Appropriate for all audiences'],
        estimatedCPM: 2.50,
        status: 'submitted',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        brandSafetyScore: 95,
        potentialIssues: []
      },
      {
        id: '2',
        title: 'Lifestyle Image Post',
        description: 'Beautiful lifestyle image showcasing our product in a natural setting.',
        type: 'image',
        url: 'https://via.placeholder.com/400x300',
        creator: {
          id: 'creator-2',
          username: 'bob_photographer',
          avatar: 'https://via.placeholder.com/40'
        },
        brandGuidelines: ['No profanity or offensive language', 'Must align with brand values', 'Appropriate for all audiences'],
        estimatedCPM: 1.80,
        status: 'under_review',
        submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        brandSafetyScore: 88,
        potentialIssues: ['Check lighting quality']
      },
      {
        id: '3',
        title: 'Educational Content',
        description: 'Informative post about industry trends and how our product fits in.',
        type: 'text',
        creator: {
          id: 'creator-3',
          username: 'charlie_educator',
          avatar: 'https://via.placeholder.com/40'
        },
        brandGuidelines: ['No profanity or offensive language', 'Must align with brand values', 'No misleading claims about products'],
        estimatedCPM: 1.20,
        status: 'approved',
        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        reviewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        reviewerNotes: 'Great educational content, approved for publication.',
        brandSafetyScore: 98
      }
    ]

    setSubmissions(mockSubmissions)
    setStats({
      totalSubmissions: mockSubmissions.length,
      pendingReview: mockSubmissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length,
      approvedToday: mockSubmissions.filter(s => s.status === 'approved').length,
      rejectedToday: 0,
      averageReviewTime: '2.5 hours',
      brandSafetyScore: 94.2
    })
  }, [])

  const handleApprove = async (submissionId: string) => {
    setIsReviewing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId 
        ? { 
            ...submission, 
            status: 'approved' as const,
            reviewedAt: new Date(),
            reviewerNotes: reviewNotes || 'Approved for publication'
          }
        : submission
    ))
    
    setSelectedSubmission(null)
    setReviewNotes('')
    setIsReviewing(false)
  }

  const handleReject = async (submissionId: string) => {
    setIsReviewing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId 
        ? { 
            ...submission, 
            status: 'rejected' as const,
            reviewedAt: new Date(),
            reviewerNotes: reviewNotes || 'Content does not meet brand guidelines'
          }
        : submission
    ))
    
    setSelectedSubmission(null)
    setReviewNotes('')
    setIsReviewing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'under_review':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />
      case 'image':
        return <Image className="w-5 h-5" />
      case 'text':
        return <FileText className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Brand Moderation Dashboard</h1>
          <p className="text-gray-600">
            Review and approve content for {company?.name || 'your brand'} to ensure brand safety
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedToday}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Brand Safety Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.brandSafetyScore}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <Shield className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Review Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageReviewTime}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Review Queue */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Content Review Queue</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {submissions.map((submission) => (
            <div key={submission.id} className="p-6">
              <div className="flex items-start space-x-4">
                {/* Content Preview */}
                <div className="flex-shrink-0">
                  {submission.type === 'video' ? (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                  ) : submission.type === 'image' ? (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{submission.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1 capitalize">{submission.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{submission.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{submission.creator.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getContentIcon(submission.type)}
                      <span className="capitalize">{submission.type}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${submission.estimatedCPM} CPM</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>{submission.brandSafetyScore}% safe</span>
                    </div>
                  </div>

                  {/* Brand Guidelines Compliance */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Brand Guidelines Compliance:</p>
                    <div className="flex flex-wrap gap-2">
                      {submission.brandGuidelines.map((guideline, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {guideline}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Potential Issues */}
                  {submission.potentialIssues && submission.potentialIssues.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Potential Issues:</p>
                      <div className="flex flex-wrap gap-2">
                        {submission.potentialIssues.map((issue, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {submission.status === 'submitted' && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Review</span>
                      </button>
                      <button
                        onClick={() => handleApprove(submission.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(submission.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Review Content</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedSubmission.title}</h4>
                  <p className="text-gray-600">{selectedSubmission.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
                    placeholder="Add notes about your review decision..."
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedSubmission.id)}
                    disabled={isReviewing}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedSubmission.id)}
                    disabled={isReviewing}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Approve
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
