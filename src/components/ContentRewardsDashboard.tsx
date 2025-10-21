import { useState, useEffect } from 'react'
import { Plus, Download, Settings, MoreVertical, ArrowUpDown, ChevronDown, Rocket } from 'lucide-react'

interface ContentReward {
  id: string
  name: string
  description: string
  cpm: number
  status: 'active' | 'paused' | 'completed'
  totalViews: number
  totalPaid: number
  approvedSubmissions: number
  totalSubmissions: number
  effectiveCPM: number
}

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
  const [activeTab, setActiveTab] = useState<'rewards' | 'analytics'>('rewards')
  const [contentRewards, setContentRewards] = useState<ContentReward[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedReward, setSelectedReward] = useState<string>('all')

  useEffect(() => {
    // Mock data - replace with real API calls
    setContentRewards([
      {
        id: '1',
        name: 'Make videos different coaching businesses you can start',
        description: 'Create content about coaching business opportunities',
        cpm: 4.00,
        status: 'active',
        totalViews: 0,
        totalPaid: 0,
        approvedSubmissions: 0,
        totalSubmissions: 0,
        effectiveCPM: 0
      }
    ])

    setSubmissions([]) // Start with empty submissions
  }, [])


  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold">Content Rewards</h1>
            </div>
            
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Create Content Reward
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Active Count */}
            <div className="text-sm text-gray-400">
              Active {contentRewards.filter(r => r.status === 'active').length}
            </div>

            {/* Content Rewards Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Content Rewards Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full"></div>
                  <div className="absolute top-8 left-8 w-8 h-8 bg-white rounded-full"></div>
                  <div className="absolute top-12 left-12 w-4 h-4 bg-white rounded-full"></div>
                  <div className="absolute top-16 left-16 w-2 h-2 bg-white rounded-full"></div>
                  <div className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full"></div>
                </div>
                
                {/* Whop Logo */}
                <div className="relative z-10 w-6 h-6 bg-white rounded flex items-center justify-center mb-4">
                  <span className="text-orange-500 font-bold text-xs">W</span>
                </div>
                
                {/* Main Content */}
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-white mb-2">Content rewards</h2>
                  <p className="text-white/90 text-lg">create. post. earn.</p>
                </div>
              </div>

              {/* Right Side - Reward Details */}
              {contentRewards.length > 0 && (
                <div className="space-y-4">
                  {contentRewards.map((reward) => (
                    <div key={reward.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                      <div className="text-gray-400 mb-4">${reward.totalPaid} of $200 paid out</div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-gray-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <div className="text-right text-sm text-gray-400 mt-1">0%</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            ${reward.cpm} / 1K
                          </span>
                          <div className="flex items-center space-x-2">
                            {/* Platform Icons */}
                            <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-orange-500 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">IG</span>
                            </div>
                            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">TT</span>
                            </div>
                            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">X</span>
                            </div>
                            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">YT</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Filter Dropdown */}
            <div className="flex justify-between items-center">
              <select 
                value={selectedReward}
                onChange={(e) => setSelectedReward(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Content Rewards</option>
                {contentRewards.map((reward) => (
                  <option key={reward.id} value={reward.id}>{reward.name}</option>
                ))}
              </select>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Total views generated</div>
                <div className="text-2xl font-bold text-white">0</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Total amount paid out</div>
                <div className="text-2xl font-bold text-white">$0.00</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Effective CPM</div>
                <div className="text-2xl font-bold text-white">$0.00</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Approved submissions</div>
                <div className="text-2xl font-bold text-white">0</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Total submissions</div>
                <div className="text-2xl font-bold text-white">0</div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Total approved views</h3>
              <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submissions Modal/View */}
      <SubmissionsView 
        submissions={submissions}
      />
    </div>
  )
}

function SubmissionsView({ 
  submissions
}: { 
  submissions: Submission[]
}) {
  return (
    <div className="bg-gray-900 text-white">
      {/* Chart Placeholder */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">A view chart for approved submissions will be displayed here</p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Date Created
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              Status <span className="ml-1 text-red-400">×</span> Approved <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Platform
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-5 gap-4 text-sm font-medium">
            <div className="flex items-center">
              User <MoreVertical className="w-4 h-4 ml-1" />
            </div>
            <div className="flex items-center">
              Status <MoreVertical className="w-4 h-4 ml-1" />
            </div>
            <div className="flex items-center">
              Paid <ArrowUpDown className="w-4 h-4 ml-1" />
            </div>
            <div className="flex items-center">
              Views <ArrowUpDown className="w-4 h-4 ml-1" />
            </div>
            <div className="flex items-center">
              Likes <MoreVertical className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
              <Rocket className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No submissions yet</h2>
            <p className="text-gray-400">
              Once a user creates a submission, it will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="border-b border-gray-700 py-4">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full mr-3"></div>
                    <span>{submission.user}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      submission.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                      submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                      submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {submission.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={submission.paid ? 'text-green-400' : 'text-gray-400'}>
                      {submission.paid ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {submission.views.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    {submission.likes.toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span><strong>Private Link:</strong> {submission.content.privateVideoLink}</span>
                    {submission.content.publicVideoLink && (
                      <span><strong>Public Link:</strong> {submission.content.publicVideoLink}</span>
                    )}
                  </div>
                  {submission.status === 'approved' && !submission.content.publicVideoLink && (
                    <div className="text-yellow-500 mt-1">
                      ⚠️ Creator needs to make video public to start tracking views
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
