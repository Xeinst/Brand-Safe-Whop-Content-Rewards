import { useState, useEffect } from 'react'
import { Upload, Link, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useWhopSDK, ContentReward } from '../lib/whop-sdk'

interface SubmissionForm {
  title: string
  description: string
  videoUrl: string
  platform: string
  contentRewardId: string
}

export function ContentSubmissionView() {
  const sdk = useWhopSDK()
  const [activeRewards, setActiveRewards] = useState<ContentReward[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState<SubmissionForm>({
    title: '',
    description: '',
    videoUrl: '',
    platform: 'youtube',
    contentRewardId: ''
  })

  useEffect(() => {
    const loadRewards = async () => {
      if (!sdk) return
      
      setLoading(true)
      try {
        const rewards = await sdk.getContentRewards()
        const active = rewards.filter(r => r.status === 'active')
        setActiveRewards(active)
        
        if (active.length > 0) {
          setFormData(prev => ({ ...prev, contentRewardId: active[0].id }))
        }
      } catch (error) {
        console.error('Error loading rewards:', error)
        // Fallback to mock data for development
        const mockRewards = [
          {
            id: 'demo-reward-1',
            name: 'Make videos different coaching businesses you can start',
            description: 'Create content about coaching business opportunities',
            cpm: 4.00,
            status: 'active' as const,
            totalViews: 0,
            totalPaid: 0,
            approvedSubmissions: 0,
            totalSubmissions: 0,
            effectiveCPM: 4.00
          }
        ]
        setActiveRewards(mockRewards)
        setFormData(prev => ({ ...prev, contentRewardId: mockRewards[0].id }))
      } finally {
        setLoading(false)
      }
    }

    loadRewards()
  }, [sdk])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sdk || !formData.title || !formData.videoUrl) return

    setSubmitting(true)
    setSubmissionStatus('idle')

    try {
      // Extract video ID from URL
      const videoId = extractVideoId(formData.videoUrl)
      if (!videoId) {
        throw new Error('Invalid video URL')
      }

      // Create submission using SDK
      const submission = {
        user: sdk.user?.id || 'demo-user',
        content: {
          title: formData.title,
          privateVideoLink: formData.videoUrl,
          publicVideoLink: null,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          platform: formData.platform
        },
        status: 'pending_approval' as const,
        paid: false,
        views: 0,
        likes: 0,
        submissionDate: new Date(),
        publishedDate: null
      }

      await sdk.createSubmission(submission)

      setSubmissionStatus('success')
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        platform: 'youtube',
        contentRewardId: activeRewards[0]?.id || ''
      })
    } catch (error) {
      console.error('Submission error:', error)
      setSubmissionStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
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
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-whop-dragon-fire">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold">Submit Content</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Submit Your Content for Review</h2>
          
          {submissionStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-400">Content submitted successfully! We'll review it and get back to you soon.</span>
            </div>
          )}

          {submissionStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-400">Failed to submit content. Please try again.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Reward Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content Reward
              </label>
              <select
                value={formData.contentRewardId}
                onChange={(e) => setFormData(prev => ({ ...prev, contentRewardId: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
                required
              >
                <option value="">Select a content reward</option>
                {activeRewards.map(reward => (
                  <option key={reward.id} value={reward.id}>
                    {reward.name} - ${reward.cpm}/1000 views
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
                placeholder="Enter your content title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
                rows={4}
                placeholder="Describe your content..."
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
                <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Supported platforms: YouTube, YouTube Shorts
              </p>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
              >
                <option value="youtube">YouTube</option>
                <option value="youtube_shorts">YouTube Shorts</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !formData.title || !formData.videoUrl || !formData.contentRewardId}
                className="px-6 py-3 bg-whop-dragon-fire hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit Content</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Guidelines */}
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Submission Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Content must be brand-safe and appropriate for all audiences</li>
              <li>• Videos should be high quality and engaging</li>
              <li>• Include relevant hashtags and descriptions</li>
              <li>• Content will be reviewed within 24-48 hours</li>
              <li>• You'll earn CPM rewards for approved content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}