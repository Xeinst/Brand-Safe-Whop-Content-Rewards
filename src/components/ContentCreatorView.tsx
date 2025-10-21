import { useState, useEffect } from 'react'
import { extractYouTubeVideoId } from '../lib/youtube'
import { CheckCircle, XCircle, Plus, Settings, MoreVertical, ChevronDown, ArrowUpDown } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'rewards' | 'submissions'>('rewards')
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
        setActiveRewards([
          {
            id: '1',
            name: 'Gaming Chair Review Campaign',
            description: 'Create a review video of our premium gaming chairs',
            cpm: 4.00,
            requirements: ['Unlisted video', 'Honest review', 'Show features'],
            status: 'active'
          }
        ])
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold">Content Rewards</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">
                How do Content Rewards work?
              </a>
              <button className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                <Settings className="w-4 h-4 mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900 border-b border-gray-700">
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
              Rewards
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}
            >
              My submissions
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

            {/* Active Rewards */}
            {activeRewards.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No active <span className="text-yellow-400">Content Rewards</span></h3>
                <p className="text-gray-400">There are no active Content Rewards.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRewards.map((reward) => (
                  <div key={reward.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{reward.name}</h3>
                        <p className="text-gray-400 mb-4">{reward.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <span>CPM: ${reward.cpm}</span>
                          <span>•</span>
                          <span>Status: Active</span>
                        </div>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Participate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ended Rewards */}
            {endedRewards.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Ended {endedRewards.length}</h3>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {endedRewards.map((reward) => (
                    <div key={reward.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">{reward.name}</h4>
                          <p className="text-sm text-gray-400">CPM: ${reward.cpm}</p>
                        </div>
                        <span className="text-sm text-gray-400 capitalize">{reward.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button className="px-3 py-2 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:bg-gray-800 transition-colors flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Status
                </button>
              </div>
            </div>

            {/* Table Header */}
            <div className="bg-gray-800 rounded-lg">
              <div className="px-4 py-3 bg-gray-700 rounded-t-lg">
                <div className="grid grid-cols-6 gap-4 text-sm text-gray-300">
                  <div className="flex items-center">
                    Title
                  </div>
                  <div className="flex items-center">
                    Status
                    <MoreVertical className="w-4 h-4 ml-2" />
                  </div>
                  <div className="flex items-center">
                    Total views
                    <MoreVertical className="w-4 h-4 ml-2" />
                  </div>
                  <div className="flex items-center">
                    Submission
                    <MoreVertical className="w-4 h-4 ml-2" />
                  </div>
                  <div className="flex items-center">
                    Reward rate
                    <MoreVertical className="w-4 h-4 ml-2" />
                  </div>
                  <div className="flex items-center">
                    Paid out to you
                    <ChevronDown className="w-4 h-4 ml-2" />
                    <MoreVertical className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>

              {/* Empty State */}
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No submissions here</h3>
                <p className="text-gray-400">Start submitting content to earn money!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}