import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  DollarSign, 
  CheckCircle, 
  Target,
  Filter
} from 'lucide-react'

interface AnalyticsData {
  totalSubmissions: number
  approvedContent: number
  rejectedContent: number
  pendingReview: number
  totalEarnings: number
  averageCPM: number
  totalViews: number
  engagementRate: number
  brandSafetyScore: number
  averageReviewTime: string
}

interface ContentAnalytics {
  id: string
  title: string
  type: 'video' | 'image' | 'text'
  views: number
  likes: number
  shares: number
  comments: number
  engagement: number
  cpmEarnings: number
  approvalDate: Date
  creator: string
}


export function AnalyticsView() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [contentData, setContentData] = useState<ContentAnalytics[]>([])
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      
      // Mock analytics data
      const mockAnalytics: AnalyticsData = {
        totalSubmissions: 156,
        approvedContent: 89,
        rejectedContent: 23,
        pendingReview: 44,
        totalEarnings: 2847.50,
        averageCPM: 2.15,
        totalViews: 1250000,
        engagementRate: 6.2,
        brandSafetyScore: 94.2,
        averageReviewTime: '2.5 hours'
      }

      const mockContentData: ContentAnalytics[] = [
        {
          id: '1',
          title: 'Product Demo Video',
          type: 'video',
          views: 15420,
          likes: 892,
          shares: 156,
          comments: 78,
          engagement: 6.8,
          cpmEarnings: 38.55,
          approvalDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          creator: 'alice_creator'
        },
        {
          id: '2',
          title: 'Lifestyle Image Post',
          type: 'image',
          views: 8930,
          likes: 445,
          shares: 78,
          comments: 34,
          engagement: 5.9,
          cpmEarnings: 16.07,
          approvalDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          creator: 'bob_photographer'
        },
        {
          id: '3',
          title: 'Educational Content',
          type: 'text',
          views: 12500,
          likes: 623,
          shares: 134,
          comments: 89,
          engagement: 6.1,
          cpmEarnings: 15.00,
          approvalDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          creator: 'charlie_educator'
        }
      ]


      setAnalytics(mockAnalytics)
      setContentData(mockContentData)
      setLoading(false)
    }

    loadAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whop-primary"></div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">
                Comprehensive insights into your brand-safe content performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5% from last period
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {((analytics.approvedContent / analytics.totalSubmissions) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.3% from last period
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalEarnings.toFixed(2)}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +18.7% from last period
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Brand Safety Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.brandSafetyScore}%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +1.2% from last period
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Content Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Views</span>
                <span className="text-sm font-medium text-gray-900">
                  {analytics.totalViews.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement Rate</span>
                <span className="text-sm font-medium text-gray-900">{analytics.engagementRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analytics.engagementRate * 10}%` }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average CPM</span>
                <span className="text-sm font-medium text-gray-900">${analytics.averageCPM}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Review Process</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Review</span>
                <span className="text-sm font-medium text-gray-900">{analytics.pendingReview}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Review Time</span>
                <span className="text-sm font-medium text-gray-900">{analytics.averageReviewTime}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rejection Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {((analytics.rejectedContent / analytics.totalSubmissions) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Performing Content</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contentData.map((content) => (
                <tr key={content.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{content.title}</div>
                    <div className="text-sm text-gray-500 capitalize">{content.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{content.creator}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Eye className="w-4 h-4 mr-1 text-gray-400" />
                      {content.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{content.engagement}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      ${content.cpmEarnings.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {content.approvalDate.toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Series Chart Placeholder */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance Over Time</h3>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization would go here</p>
              <p className="text-sm text-gray-500 mt-2">
                Integration with Chart.js or similar library for interactive charts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
