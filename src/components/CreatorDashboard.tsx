import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { WhopPaymentIntegration } from './WhopPaymentIntegration'
import { 
  Upload, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  Play,
  Calendar,
  Target,
  Users,
  BarChart3
} from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  thumbnail: string
  status: 'pending' | 'approved' | 'rejected'
  uploadDate: Date
  views: number
  cpmEarnings: number
  duration: string
}

interface EarningsData {
  totalEarnings: number
  pendingPayouts: number
  thisMonth: number
  lifetimeEarnings: number
}

export function CreatorDashboard() {
  const { user } = useWhopSDK()
  const [content, setContent] = useState<ContentItem[]>([])
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'analytics' | 'payments'>('dashboard')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Mock data - replace with real Whop API calls
    setContent([
      {
        id: '1',
        title: 'Product Review - Gaming Chair',
        thumbnail: '/api/placeholder/300/200',
        status: 'approved',
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        views: 15420,
        cpmEarnings: 45.60,
        duration: '3:45'
      },
      {
        id: '2',
        title: 'Tech Unboxing Video',
        thumbnail: '/api/placeholder/300/200',
        status: 'pending',
        uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        views: 0,
        cpmEarnings: 0,
        duration: '5:20'
      },
      {
        id: '3',
        title: 'Brand Campaign - Fitness',
        thumbnail: '/api/placeholder/300/200',
        status: 'approved',
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        views: 28750,
        cpmEarnings: 78.90,
        duration: '4:15'
      }
    ])

    setEarnings({
      totalEarnings: 124.50,
      pendingPayouts: 45.60,
      thisMonth: 78.90,
      lifetimeEarnings: 2450.75
    })
  }, [])

  const handleFileUpload = async (files: FileList) => {
    setUploading(true)
    // Simulate upload process
    setTimeout(() => {
      setUploading(false)
      // Add new content item
      const newContent: ContentItem = {
        id: Date.now().toString(),
        title: files[0].name,
        thumbnail: '/api/placeholder/300/200',
        status: 'pending',
        uploadDate: new Date(),
        views: 0,
        cpmEarnings: 0,
        duration: '0:00'
      }
      setContent(prev => [newContent, ...prev])
    }, 2000)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* FrostedUI Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-whop-primary to-whop-secondary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Creator Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold">{user?.display_name || 'Creator'}</span>
              </div>
              <button
                onClick={() => setActiveTab('upload')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-whop-primary to-whop-secondary text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Content
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
            { id: 'upload', label: 'Upload', icon: Upload },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-whop-primary text-whop-primary'
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
            {/* Earnings Overview */}
            {earnings && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-gray-900">${earnings.totalEarnings.toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                      <p className="text-2xl font-bold text-gray-900">${earnings.pendingPayouts.toFixed(2)}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">${earnings.thisMonth.toFixed(2)}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Lifetime</p>
                      <p className="text-2xl font-bold text-gray-900">${earnings.lifetimeEarnings.toFixed(2)}</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Content Library */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your Content</h2>
                <p className="text-sm text-gray-600">Track your uploaded content and earnings</p>
              </div>
              
              <div className="p-6">
                <div className="grid gap-6">
                  {content.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                      <div className="relative w-20 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                          {item.duration}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(item.status)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Eye className="w-3 h-3" />
                            <span>{item.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <DollarSign className="w-3 h-3" />
                            <span>${item.cpmEarnings.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-8">
            <div className="text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload New Content</h2>
              <p className="text-gray-600 mb-6">Upload your clips to start earning CPM rewards</p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-whop-primary transition-colors">
                <input
                  type="file"
                  multiple
                  accept="video/*,image/*"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4, MOV, AVI up to 100MB
                    </p>
                  </div>
                </label>
              </div>
              
              {uploading && (
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-whop-primary"></div>
                  <span className="text-sm text-gray-600">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <WhopPaymentIntegration />
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
