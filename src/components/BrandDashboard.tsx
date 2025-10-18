import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  DollarSign, 
  Users, 
  BarChart3,
  Shield,
  Play,
  Calendar,
  Target,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  thumbnail: string
  creator: string
  uploadDate: Date
  duration: string
  status: 'pending' | 'approved' | 'rejected'
  views?: number
  cpmEarnings?: number
  brandSafetyScore: number
  tags: string[]
}

interface CampaignData {
  id: string
  name: string
  budget: number
  spent: number
  contentCount: number
  status: 'active' | 'paused' | 'completed'
}

interface BrandStats {
  totalContent: number
  pendingReview: number
  approvedToday: number
  totalSpent: number
}

export function BrandDashboard() {
  const { company } = useWhopSDK()
  const [content, setContent] = useState<ContentItem[]>([])
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [stats, setStats] = useState<BrandStats | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'moderate' | 'campaigns' | 'analytics'>('dashboard')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    // Mock data - replace with real Whop API calls
    setContent([
      {
        id: '1',
        title: 'Product Review - Gaming Chair',
        thumbnail: '/api/placeholder/300/200',
        creator: 'TechReviewer_123',
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        duration: '3:45',
        status: 'pending',
        brandSafetyScore: 85,
        tags: ['gaming', 'review', 'chair']
      },
      {
        id: '2',
        title: 'Tech Unboxing Video',
        thumbnail: '/api/placeholder/300/200',
        creator: 'GadgetUnboxer',
        uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        duration: '5:20',
        status: 'approved',
        views: 15420,
        cpmEarnings: 45.60,
        brandSafetyScore: 92,
        tags: ['tech', 'unboxing', 'electronics']
      },
      {
        id: '3',
        title: 'Brand Campaign - Fitness',
        thumbnail: '/api/placeholder/300/200',
        creator: 'FitnessGuru_99',
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        duration: '4:15',
        status: 'rejected',
        brandSafetyScore: 45,
        tags: ['fitness', 'campaign', 'workout']
      }
    ])

    setCampaigns([
      {
        id: '1',
        name: 'Gaming Chair OP Campaign',
        budget: 5000,
        spent: 2450,
        contentCount: 12,
        status: 'active'
      },
      {
        id: '2',
        name: 'Tech Review Initiative',
        budget: 3000,
        spent: 3000,
        contentCount: 8,
        status: 'completed'
      }
    ])

    setStats({
      totalContent: 156,
      pendingReview: 23,
      approvedToday: 8,
      totalSpent: 12500
    })
  }, [])

  const handleApprove = (contentId: string) => {
    setContent(prev => prev.map(item => 
      item.id === contentId ? { ...item, status: 'approved' as const } : item
    ))
  }

  const handleReject = (contentId: string) => {
    setContent(prev => prev.map(item => 
      item.id === contentId ? { ...item, status: 'rejected' as const } : item
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredContent = content.filter(item => 
    filterStatus === 'all' || item.status === filterStatus
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* FrostedUI Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Brand Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {company?.name || 'Brand Manager'}
              </div>
              <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200">
                <Shield className="w-4 h-4 mr-2" />
                Brand Safety
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 border-b border-gray-200 mt-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'moderate', label: 'Moderate', icon: Shield },
            { id: 'campaigns', label: 'Campaigns', icon: Target },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Content</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalContent}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved Today</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.approvedToday}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Recent Campaigns */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Active Campaigns</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {campaigns.filter(c => c.status === 'active').map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.contentCount} pieces of content</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                        </p>
                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'moderate' && (
          <div className="space-y-6">
            {/* Filter Controls */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  {filteredContent.length} items
                </div>
              </div>
            </div>

            {/* Content Review */}
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <div key={item.id} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6">
                  <div className="flex space-x-6">
                    <div className="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                        {item.duration}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">by {item.creator}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(item.status)}
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                            <div className={`text-sm font-medium ${getSafetyScoreColor(item.brandSafetyScore)}`}>
                              Safety Score: {item.brandSafetyScore}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.uploadDate.toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.tags.map((tag, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {item.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="inline-flex items-center px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              className="inline-flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Campaign Management</h2>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-6 bg-gray-50/50 rounded-xl border border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign.contentCount} pieces of content</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                      </p>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics</h2>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Analytics coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
