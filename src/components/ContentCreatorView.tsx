import { useState, useEffect } from 'react'
import { extractYouTubeVideoId } from '../lib/youtube'
import { CheckCircle, XCircle, Plus, Settings, MoreVertical, ChevronDown, ArrowUpDown, Download, Edit } from 'lucide-react'
import { useWhopSDK } from '../lib/whop-sdk'

interface ContentReward {
  id: string
  name: string
  description: string
  cpm: number
  requirements: string[]
  status: 'active' | 'paused' | 'completed'
}

interface Submission {
  id: string
  rewardId: string
  title: string
  description: string
  privateVideoLink: string
  publicVideoLink: string | null
  thumbnail: string
  status: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'published'
  submittedAt: Date | null
  publishedAt: Date | null
  estimatedEarnings: number
  actualViews: number
  rewardRate: number
  paidOut: number
}

export function ContentCreatorView() {
  const sdk = useWhopSDK()
  const [activeTab, setActiveTab] = useState<'rewards' | 'analytics'>('rewards')
  const [activeRewards, setActiveRewards] = useState<ContentReward[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [endedRewards, setEndedRewards] = useState<ContentReward[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!sdk) return
      
      setLoading(true)
      try {
        // Load content rewards and submissions from SDK
        const rewardsData = await sdk.getContentRewards()
        const submissionsData = await sdk.getSubmissions()
        
        // Filter active vs ended rewards
        const active = rewardsData.filter(r => r.status === 'active')
        const ended = rewardsData.filter(r => r.status === 'completed' || r.status === 'paused')
        
        setActiveRewards(active)
        setEndedRewards(ended)
        setSubmissions(submissionsData)
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback to mock data
        setActiveRewards([])
        setSubmissions([])
        setEndedRewards([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sdk])

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
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-whop-dragon-fire">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold text-whop-midnight">Content Rewards</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm transition-colors text-whop-byzantine-blue hover:text-blue-700">
                How do Content Rewards work?
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rewards'
                  ? 'text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
              style={activeTab === 'rewards' ? {borderBottomColor: 'var(--whop-dragon-fire)'} : {}}
            >
              Content Rewards
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
              style={activeTab === 'analytics' ? {borderBottomColor: 'var(--whop-dragon-fire)'} : {}}
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
              <span className="text-white">Active {activeRewards.length}</span>
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
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="text-sm text-gray-500 mb-1">Total views generated</h3>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="text-sm text-gray-500 mb-1">Total amount paid out</h3>
                <p className="text-2xl font-bold text-gray-900">$0.00</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="text-sm text-gray-500 mb-1">Effective CPM</h3>
                <p className="text-2xl font-bold text-gray-900">$0.00</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="text-sm text-gray-500 mb-1">Approved submissions</h3>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h3 className="text-sm text-gray-500 mb-1">Total submissions</h3>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
                    
            {/* Chart Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Total approved views</h3>
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">A view chart for approved submissions will be displayed here</p>
              </div>
            </div>

            {/* Submissions Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {/* Filter and Action Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button className="px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Date Created
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                      <span className="mr-2">Status | Approved</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Platform
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
                </div>
                
              {/* Table Header */}
              <div className="px-4 py-3 bg-gray-50">
                <div className="grid grid-cols-5 gap-4 text-sm text-gray-600">
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