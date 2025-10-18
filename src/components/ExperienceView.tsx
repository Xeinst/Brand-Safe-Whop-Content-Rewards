import React, { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { Star, Award, Users, TrendingUp, Shield, Target } from 'lucide-react'

interface Reward {
  id: string
  title: string
  description: string
  points: number
  category: 'engagement' | 'content' | 'community'
  isCompleted: boolean
  progress?: number
}

export function ExperienceView() {
  const { user, company } = useWhopSDK()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [userPoints, setUserPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user data and rewards
    const loadData = async () => {
      setLoading(true)
      // In a real app, you would fetch this data from your backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockRewards: Reward[] = [
        {
          id: '1',
          title: 'Create Quality Content',
          description: 'Share engaging content that adds value to the community',
          points: 50,
          category: 'content',
          isCompleted: false,
          progress: 60
        },
        {
          id: '2',
          title: 'Engage with Community',
          description: 'Like, comment, and share community posts to build engagement',
          points: 30,
          category: 'engagement',
          isCompleted: true
        },
        {
          id: '3',
          title: 'Help Community Growth',
          description: 'Invite friends and help grow the community',
          points: 25,
          category: 'community',
          isCompleted: false,
          progress: 20
        },
        {
          id: '4',
          title: 'Post Daily Content',
          description: 'Maintain consistent posting schedule to build audience',
          points: 100,
          category: 'content',
          isCompleted: false,
          progress: 0
        }
      ]
      
      setRewards(mockRewards)
      setUserPoints(305) // Mock user points
      setLoading(false)
    }

    loadData()
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement':
        return <Users className="w-5 h-5" />
      case 'content':
        return <Star className="w-5 h-5" />
      case 'community':
        return <Shield className="w-5 h-5" />
      default:
        return <Award className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'engagement':
        return 'bg-blue-100 text-blue-800'
      case 'content':
        return 'bg-green-100 text-green-800'
      case 'community':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whop-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-whop-primary rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.username || 'User'}!
              </h1>
              <p className="text-gray-600">
                Earn rewards by creating and sharing content in {company?.name || 'your community'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Points Summary */}
      <div className="bg-gradient-to-r from-whop-primary to-whop-secondary rounded-lg shadow">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Your Points</h2>
              <p className="text-white/80">Keep earning to unlock exclusive rewards!</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{userPoints}</div>
              <div className="text-white/80">points earned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Available Rewards</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`border rounded-lg p-4 ${
                  reward.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      reward.isCompleted ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {getCategoryIcon(reward.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{reward.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(reward.category)}`}>
                          {reward.category}
                        </span>
                        <span className="text-sm font-medium text-whop-primary">
                          +{reward.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {reward.isCompleted ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                </div>
                {!reward.isCompleted && reward.progress !== undefined && reward.progress > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{reward.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-whop-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${reward.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-whop-primary">
              <Target className="w-4 h-4 mr-2" />
              Report Content
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-whop-primary">
              <Star className="w-4 h-4 mr-2" />
              Share Content
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-whop-primary">
              <Users className="w-4 h-4 mr-2" />
              Engage Community
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
