import { useState, useEffect } from 'react'
import { Plus, Settings, MoreVertical } from 'lucide-react'
import { useWhopSDK } from '../lib/whop-sdk'

// interface ContentReward {
//   id: string
//   name: string
//   description: string
//   cpm: number
//   status: 'active' | 'paused' | 'completed'
//   totalViews: number
//   totalPaid: number
//   approvedSubmissions: number
//   totalSubmissions: number
//   effectiveCPM: number
// }

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
  // const [contentRewards, setContentRewards] = useState<ContentReward[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  // const [selectedReward, setSelectedReward] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRealData = async () => {
      if (!sdk) return
      
      setLoading(true)
      try {
        // Load real content rewards from Whop SDK
        // const rewards = await sdk.getContentRewards()
        // setContentRewards(rewards)
        
        // Load real submissions from Whop SDK
        const submissionsData = await sdk.getSubmissions()
        setSubmissions(submissionsData)
      } catch (error) {
        console.error('Failed to load real data:', error)
        // Fallback to mock data for development
        // setContentRewards([
        //   {
        //     id: '1',
        //     name: 'Make videos different coaching businesses you can start',
        //     description: 'Create content about coaching business opportunities',
        //     cpm: 4.00,
        //     status: 'active',
        //     totalViews: 0,
        //     totalPaid: 0,
        //     approvedSubmissions: 0,
        //     totalSubmissions: 0,
        //     effectiveCPM: 0
        //   }
        // ])
        setSubmissions([
          {
            id: '1',
            user: 'creator123',
            status: 'pending_approval',
            paid: false,
            views: 0,
            likes: 0,
            submissionDate: new Date(),
            publishedDate: null,
            content: {
              title: 'Sample Video Title',
              privateVideoLink: 'https://youtube.com/watch?v=sample',
              publicVideoLink: null,
              thumbnail: 'https://img.youtube.com/vi/sample/maxresdefault.jpg',
              platform: 'youtube'
            }
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadRealData()
  }, [sdk])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const handleApproveSubmission = async (submissionId: string) => {
    if (!sdk) return
    
    try {
      await sdk.approveSubmission(submissionId)
      // Refresh submissions
      const updatedSubmissions = await sdk.getSubmissions()
      setSubmissions(updatedSubmissions)
    } catch (error) {
      console.error('Failed to approve submission:', error)
    }
  }

  const handleRejectSubmission = async (submissionId: string, reason: string) => {
    if (!sdk) return
    
    try {
      await sdk.rejectSubmission(submissionId, reason)
      // Refresh submissions
      const updatedSubmissions = await sdk.getSubmissions()
      setSubmissions(updatedSubmissions)
    } catch (error) {
      console.error('Failed to reject submission:', error)
    }
  }

  // const handleCreateReward = async (rewardData: Omit<ContentReward, 'id'>) => {
  //   if (!sdk) return
  //   
  //   try {
  //     const newReward = await sdk.createContentReward(rewardData)
  //     setContentRewards(prev => [...prev, newReward])
  //   } catch (error) {
  //     console.error('Failed to create reward:', error)
  //   }
  // }

  // const handleUpdateReward = async (id: string, updates: Partial<ContentReward>) => {
  //   if (!sdk) return
  //   
  //   try {
  //     const updatedReward = await sdk.updateContentReward(id, updates)
  //     setContentRewards(prev => prev.map(reward => 
  //       reward.id === id ? updatedReward : reward
  //     ))
  //   } catch (error) {
  //     console.error('Failed to update reward:', error)
  //   }
  // }

  // Filter submissions based on selected reward
  const filteredSubmissions = submissions

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-lg">W</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Content Rewards</h1>
                <p className="text-gray-400">Manage your brand-safe content rewards program</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>New Reward</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rewards'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Content Rewards
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Content Rewards Card */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Content rewards</h2>
                    <p className="text-orange-100">Create and manage your content rewards</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">$4.00</div>
                    <div className="text-orange-100">CPM</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-orange-100 text-sm">Total views</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-orange-100 text-sm">Total paid</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-orange-100 text-sm">Approved submissions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reward Details */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Reward Details</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 text-sm">Active</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">CPM</h4>
                  <div className="text-3xl font-bold text-white">$4.00</div>
                  <p className="text-gray-400 text-sm mt-2">Cost per thousand views</p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Payout status</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">YT</span>
                    </div>
                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TT</span>
                    </div>
                    <span className="text-gray-400 text-sm ml-2">Connected platforms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-gray-400 text-sm">Total views</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-gray-400 text-sm">Total submissions</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-gray-400 text-sm">Approved</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-gray-400 text-sm">Pending</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">$0.00</div>
                  <div className="text-gray-400 text-sm">Total paid</div>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="bg-gray-700 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-4">📊</div>
                <p className="text-gray-400">Analytics chart will be displayed here</p>
              </div>
            </div>

            {/* Submissions */}
            <SubmissionsView 
              submissions={filteredSubmissions}
              onApprove={handleApproveSubmission}
              onReject={handleRejectSubmission}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">Analytics Dashboard</h3>
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">📊</div>
                <p className="text-gray-400">Detailed analytics will be displayed here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SubmissionsView({ 
  submissions, 
  onApprove, 
  onReject 
}: { 
  submissions: Submission[]
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  
  const filteredSubmissions = submissions.filter(submission => {
    switch (filter) {
      case 'pending':
        return submission.status === 'pending_approval'
      case 'approved':
        return submission.status === 'approved'
      case 'rejected':
        return submission.status === 'rejected'
      default:
        return true
    }
  })

  return (
    <div className="bg-gray-800 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Submissions</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'pending' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'approved' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'rejected' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-gray-400 mb-4">📝</div>
          <h3 className="text-lg font-semibold text-white mb-2">No submissions yet</h3>
          <p className="text-gray-400">Submissions will appear here once creators start submitting content.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Title <MoreVertical className="w-4 h-4 ml-1 inline" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status <MoreVertical className="w-4 h-4 ml-1 inline" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total views <MoreVertical className="w-4 h-4 ml-1 inline" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Submission <MoreVertical className="w-4 h-4 ml-1 inline" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Reward rate <MoreVertical className="w-4 h-4 ml-1 inline" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Paid <MoreVertical className="w-4 h-4 ml-1 inline" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={submission.content.thumbnail} 
                        alt={submission.content.title}
                        className="w-12 h-8 rounded object-cover mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-white truncate max-w-xs">
                          {submission.content.title}
                        </div>
                        <div className="text-sm text-gray-400">{submission.user}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      submission.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : submission.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {submission.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {submission.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {submission.submissionDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    $4.00 CPM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      submission.paid 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {submission.paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {submission.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => onApprove(submission.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(submission.id, 'Not brand-safe')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
