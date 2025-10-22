import { useState, useEffect } from 'react'
import { Plus, Settings, MoreVertical, ArrowUpDown, ChevronDown, Download, Edit } from 'lucide-react'
import { useWhopSDK } from '../lib/whop-sdk'

interface Submission {
  id: string
  user: string
  status: 'pending_approval' | 'approved' | 'rejected' | 'published'
  paid: boolean
  views: number
  likes: number
  submissionDate: Date
  publishedDate: Date | null
  content: {
    title: string
    privateVideoLink: string
    publicVideoLink: string | null
    thumbnail: string
    platform: string
  }
}

export function ContentRewardsDashboard() {
  const sdk = useWhopSDK()
  const [activeTab, setActiveTab] = useState<'rewards' | 'analytics'>('rewards')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRealData = async () => {
      if (!sdk) return
      
      setLoading(true)
      try {
        // Load real submissions from Whop SDK
        const submissionsData = await sdk.getSubmissions()
        setSubmissions(submissionsData)
      } catch (error) {
        console.error('Error loading submissions:', error)
        // Fallback to empty array
        setSubmissions([])
      } finally {
        setLoading(false)
      }
    }

    loadRealData()
  }, [sdk])

  const handleApproveSubmission = async (id: string) => {
    if (!sdk) return
    
    try {
      await sdk.approveSubmission(id)
      // Refresh submissions
      const updatedSubmissions = await sdk.getSubmissions()
      setSubmissions(updatedSubmissions)
    } catch (error) {
      console.error('Error approving submission:', error)
    }
  }

  const handleRejectSubmission = async (id: string, reason: string) => {
    if (!sdk) return
    
    try {
      await sdk.rejectSubmission(id, reason)
      // Refresh submissions
      const updatedSubmissions = await sdk.getSubmissions()
      setSubmissions(updatedSubmissions)
    } catch (error) {
      console.error('Error rejecting submission:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'published':
        return 'bg-blue-100 text-blue-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold">Content Rewards</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create Content Reward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="backdrop-blur-md bg-white/5 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rewards'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}
            >
              Content Rewards
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Active Count */}
            <div className="flex items-center space-x-4">
              <span className="text-white">Active 0</span>
            </div>

            {/* Empty State */}
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No active Content Rewards</h3>
              <p className="text-gray-400 mb-4">You don't have any active Content Rewards. Create one to start paying out users.</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Create Content Reward
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button className="px-3 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                  All Content Rewards
                  <ChevronDown className="w-4 h-4 ml-2 inline" />
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/20">
                <h3 className="text-sm text-gray-400 mb-1">Total views generated</h3>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/20">
                <h3 className="text-sm text-gray-400 mb-1">Total amount paid out</h3>
                <p className="text-2xl font-bold text-white">$0.00</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/20">
                <h3 className="text-sm text-gray-400 mb-1">Effective CPM</h3>
                <p className="text-2xl font-bold text-white">$0.00</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/20">
                <h3 className="text-sm text-gray-400 mb-1">Approved submissions</h3>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/20">
                <h3 className="text-sm text-gray-400 mb-1">Total submissions</h3>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>

            {/* Chart Section */}
            <div className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Total approved views</h3>
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-400">A view chart for approved submissions will be displayed here</p>
              </div>
            </div>

            {/* Submissions Section */}
            <div className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20">
              {/* Filter and Action Bar */}
              <div className="p-4 border-b border-white/20">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button className="px-3 py-2 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:bg-gray-700 transition-colors flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Date Created
                    </button>
                    <button className="px-3 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center">
                      <span className="mr-2">Status | Approved</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-2 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:bg-gray-700 transition-colors flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Platform
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    <button className="px-3 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className="px-4 py-3 backdrop-blur-md bg-white/5">
                <div className="grid grid-cols-5 gap-4 text-sm text-gray-300">
                  <div className="flex items-center">
                    User
                  </div>
                  <div className="flex items-center">
                    Status
                    <MoreVertical className="w-4 h-4 ml-2" />
                  </div>
                  <div className="flex items-center">
                    Paid
                    <ArrowUpDown className="w-4 h-4 ml-2" />
                    <MoreVertical className="w-4 h-4 ml-2" />
                  </div>
                  <div className="flex items-center">
                    Views
                    <ChevronDown className="w-4 h-4 ml-2" />
                    <MoreVertical className="w-4 h-4 ml-2" />
                  </div>
                  <div className="flex items-center">
                    Likes
                    <MoreVertical className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>

              {/* Empty State */}
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No submissions yet</h3>
                <p className="text-gray-400">Once a user creates a submission, it will show up here.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}