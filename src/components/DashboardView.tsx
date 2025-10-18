import React, { useState } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { 
  Settings, 
  Users, 
  TrendingUp, 
  Shield, 
  Award, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'

interface DashboardMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

interface RecentActivity {
  id: string
  type: 'reward' | 'report' | 'content'
  user: string
  action: string
  timestamp: string
  status: 'success' | 'warning' | 'info'
}

export function DashboardView() {
  const { company } = useWhopSDK()
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'reports' | 'rewards'>('overview')

  const metrics: DashboardMetric[] = [
    {
      title: 'Active Users',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: <Users className="w-5 h-5" />
    },
    {
      title: 'Rewards Given',
      value: '15,420',
      change: '+8.2%',
      trend: 'up',
      icon: <Award className="w-5 h-5" />
    },
    {
      title: 'Content Reports',
      value: '1,203',
      change: '-5.1%',
      trend: 'down',
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: 'Community Score',
      value: '98.5%',
      change: '+2.3%',
      trend: 'up',
      icon: <TrendingUp className="w-5 h-5" />
    }
  ]

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'reward',
      user: 'alice_creator',
      action: 'earned 50 points for brand-safe content',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'report',
      user: 'bob_moderator',
      action: 'reported inappropriate content',
      timestamp: '5 minutes ago',
      status: 'warning'
    },
    {
      id: '3',
      type: 'content',
      user: 'charlie_contributor',
      action: 'shared verified brand-safe content',
      timestamp: '8 minutes ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'reward',
      user: 'diana_creator',
      action: 'completed community engagement challenge',
      timestamp: '12 minutes ago',
      status: 'success'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <Target className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                    <div className="p-3 bg-whop-primary/10 rounded-lg text-whop-primary">
                      {metric.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">from last week</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(activity.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-sm text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Content Health</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Brand Safe Content</span>
                      <span className="text-sm font-medium text-green-600">94.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Flagged Content</span>
                      <span className="text-sm font-medium text-red-600">5.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '5.8%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Top Contributors</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { name: 'alice_creator', points: 2450 },
                      { name: 'charlie_contributor', points: 1890 },
                      { name: 'diana_creator', points: 1650 },
                      { name: 'eve_moderator', points: 1420 },
                      { name: 'frank_creator', points: 1180 }
                    ].map((contributor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-whop-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{index + 1}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{contributor.name}</span>
                        </div>
                        <span className="text-sm text-whop-primary font-medium">{contributor.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">App Settings</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Points for Brand-Safe Content
                </label>
                <input
                  type="number"
                  defaultValue={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points for Reporting Inappropriate Content
                </label>
                <input
                  type="number"
                  defaultValue={25}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Engagement Multiplier
                </label>
                <input
                  type="number"
                  defaultValue={1.5}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoModeration"
                  defaultChecked
                  className="h-4 w-4 text-whop-primary focus:ring-whop-primary border-gray-300 rounded"
                />
                <label htmlFor="autoModeration" className="ml-2 block text-sm text-gray-900">
                  Enable automatic content moderation
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  defaultChecked
                  className="h-4 w-4 text-whop-primary focus:ring-whop-primary border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                  Send notifications for flagged content
                </label>
              </div>
              <button className="bg-whop-primary text-white px-6 py-2 rounded-md hover:bg-whop-primary/90 transition-colors">
                Save Settings
              </button>
            </div>
          </div>
        )

      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Content Reports</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Reports</h3>
                <p className="text-gray-600">
                  View detailed analytics and reports for content moderation and community health.
                </p>
                <button className="mt-4 bg-whop-primary text-white px-6 py-2 rounded-md hover:bg-whop-primary/90 transition-colors">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )

      case 'rewards':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reward Management</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reward Configuration</h3>
                <p className="text-gray-600">
                  Configure custom rewards, tiers, and achievement systems for your community.
                </p>
                <button className="mt-4 bg-whop-primary text-white px-6 py-2 rounded-md hover:bg-whop-primary/90 transition-colors">
                  Configure Rewards
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Manage your Brand Safe Content Rewards app for {company?.name || 'your community'}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
              { id: 'reports', label: 'Reports', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'rewards', label: 'Rewards', icon: <Award className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-whop-primary text-whop-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}
