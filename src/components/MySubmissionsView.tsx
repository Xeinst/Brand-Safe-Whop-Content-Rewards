import { useState, useEffect } from 'react'
import { Eye, CheckCircle, XCircle, Clock, DollarSign, ThumbsUp, TrendingUp, Plus } from 'lucide-react'
import { useWhopSDK, Submission } from '../lib/whop-sdk'

export function MySubmissionsView() {
  const sdk = useWhopSDK()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    const loadMySubmissions = async () => {
      if (!sdk) return
      
      setLoading(true)
      try {
        const allSubmissions = await sdk.getSubmissions()
        // Filter to only show current user's submissions
        const mySubmissions = allSubmissions.filter(submission => 
          submission.user === sdk.user?.username || submission.user === sdk.user?.display_name
        )
        setSubmissions(mySubmissions)
      } catch (error) {
        console.error('Error loading my submissions:', error)
        setSubmissions([])
      } finally {
        setLoading(false)
      }
    }

    loadMySubmissions()
  }, [sdk])

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true
    if (filter === 'pending') return submission.status === 'pending_approval'
    if (filter === 'approved') return submission.status === 'approved'
    if (filter === 'rejected') return submission.status === 'rejected'
    return true
  })

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

  // Calculate user stats
  const totalViews = submissions.reduce((sum, s) => sum + s.views, 0)
  const totalLikes = submissions.reduce((sum, s) => sum + s.likes, 0)
  const approvedCount = submissions.filter(s => s.status === 'approved').length
  const totalEarnings = submissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + (s.views * 4.00 / 1000), 0) // Assuming $4 CPM

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading your submissions...</div>
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
              <h1 className="text-xl font-semibold">My Submissions</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="/submit" className="px-4 py-2 bg-whop-dragon-fire hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Submit New</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Likes</p>
                <p className="text-2xl font-bold text-white">{totalLikes.toLocaleString()}</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-white">{approvedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'all', label: 'All My Submissions', count: submissions.length },
              { key: 'pending', label: 'Pending Review', count: submissions.filter(s => s.status === 'pending_approval').length },
              { key: 'approved', label: 'Approved', count: submissions.filter(s => s.status === 'approved').length },
              { key: 'rejected', label: 'Rejected', count: submissions.filter(s => s.status === 'rejected').length }
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
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No submissions yet</h3>
            <p className="text-gray-400 mb-4">Start earning by submitting your content for review.</p>
            <a href="/submit" className="px-6 py-3 bg-whop-dragon-fire hover:bg-orange-600 text-white rounded-lg transition-colors">
              Submit Your First Video
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map(submission => (
              <div key={submission.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(submission.status)}
                      <h3 className="text-lg font-semibold text-white">{submission.content.title}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-400 mb-3">
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
                        <span>${(submission.views * 4.00 / 1000).toFixed(2)} earned</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      Submitted: {new Date(submission.submissionDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                      {submission.status.replace('_', ' ')}
                    </div>
                    
                    {submission.status === 'approved' && (
                      <div className="text-green-400 text-sm font-medium">
                        ${(submission.views * 4.00 / 1000).toFixed(2)} earned
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
