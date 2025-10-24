import { useState, useEffect } from 'react'
import { Upload, Link, CheckCircle, XCircle, AlertCircle, Video, Globe, Lock } from 'lucide-react'
import { useWhopSDK, ContentReward } from '../lib/whop-sdk'

interface SubmissionForm {
  title: string
  description: string
  videoUrl: string
  platform: string
  contentRewardId: string
  videoType: 'public' | 'unlisted' | 'private'
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
    contentRewardId: '',
    videoType: 'public'
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

      // Create submission using SDK - now defaults to PENDING_REVIEW and PRIVATE
      const submission = {
        title: formData.title,
        description: formData.description,
        storageKey: formData.videoUrl,
        thumbKey: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        campaignId: formData.contentRewardId || null
      }

      await sdk.createSubmission(submission)

      setSubmissionStatus('success')
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        platform: 'youtube',
        contentRewardId: activeRewards[0]?.id || '',
        videoType: 'public'
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
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      // Support for unlisted videos with additional parameters
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const detectVideoType = (url: string): 'public' | 'unlisted' | 'private' => {
    // For now, we'll assume all submitted videos are unlisted for brand safety
    // In a real implementation, you might check video metadata or ask the user
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'unlisted'
    }
    return 'public'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-whop-dragon-fire to-orange-500 shadow-lg">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold">Submit Content</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Submit Your Content for Review
            </h2>
            <p className="text-gray-400 text-lg">Share your videos and earn rewards for brand-safe content</p>
          </div>
          
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Content Reward Selection */}
            <div className="space-y-3">
              <label htmlFor="content-reward" className="block text-sm font-medium text-gray-300">
                Content Reward
              </label>
              <select
                id="content-reward"
                name="contentRewardId"
                value={formData.contentRewardId}
                onChange={(e) => setFormData(prev => ({ ...prev, contentRewardId: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
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
            <div className="space-y-3">
              <label htmlFor="content-title" className="block text-sm font-medium text-gray-300">
                Content Title *
              </label>
              <input
                id="content-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                placeholder="Enter your content title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label htmlFor="content-description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="content-description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent transition-all duration-200 hover:bg-gray-700/70 resize-none"
                rows={4}
                placeholder="Describe your content..."
              />
            </div>

            {/* Video Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Video Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, videoType: 'public' }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    formData.videoType === 'public'
                      ? 'border-whop-dragon-fire bg-whop-dragon-fire/10 text-whop-dragon-fire'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Globe className="w-6 h-6" />
                  <span className="text-sm font-medium">Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, videoType: 'unlisted' }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    formData.videoType === 'unlisted'
                      ? 'border-whop-dragon-fire bg-whop-dragon-fire/10 text-whop-dragon-fire'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Link className="w-6 h-6" />
                  <span className="text-sm font-medium">Unlisted</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, videoType: 'private' }))}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    formData.videoType === 'private'
                      ? 'border-whop-dragon-fire bg-whop-dragon-fire/10 text-whop-dragon-fire'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Lock className="w-6 h-6" />
                  <span className="text-sm font-medium">Private</span>
                </button>
              </div>
              <p className="text-sm text-gray-400">
                {formData.videoType === 'public' && 'Video is publicly visible and searchable'}
                {formData.videoType === 'unlisted' && 'Video is accessible via direct link only'}
                {formData.videoType === 'private' && 'Video is only visible to you'}
              </p>
            </div>

            {/* Video URL */}
            <div className="space-y-3">
              <label htmlFor="video-url" className="block text-sm font-medium text-gray-300">
                Video URL *
              </label>
              <div className="relative">
                <input
                  id="video-url"
                  name="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => {
                    const url = e.target.value
                    setFormData(prev => ({ 
                      ...prev, 
                      videoUrl: url,
                      videoType: detectVideoType(url)
                    }))
                  }}
                  className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
                <Video className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">
                Supported platforms: YouTube, YouTube Shorts (including unlisted videos)
              </p>
            </div>

            {/* Platform */}
            <div className="space-y-3">
              <label htmlFor="platform" className="block text-sm font-medium text-gray-300">
                Platform
              </label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
              >
                <option value="youtube">YouTube</option>
                <option value="youtube_shorts">YouTube Shorts</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={submitting || !formData.title || !formData.videoUrl || !formData.contentRewardId}
                className="px-8 py-4 bg-gradient-to-r from-whop-dragon-fire to-orange-600 hover:from-orange-600 hover:to-whop-dragon-fire disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:scale-100"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Submit Content</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Guidelines */}
          <div className="mt-12 p-6 bg-gray-700/30 backdrop-blur-sm rounded-2xl border border-gray-600/30">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-200">
              <AlertCircle className="w-6 h-6 mr-3 text-whop-dragon-fire" />
              Submission Guidelines
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-whop-dragon-fire rounded-full mt-2 flex-shrink-0"></div>
                  <span>Content must be brand-safe and appropriate for all audiences</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-whop-dragon-fire rounded-full mt-2 flex-shrink-0"></div>
                  <span>Videos should be high quality and engaging</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-whop-dragon-fire rounded-full mt-2 flex-shrink-0"></div>
                  <span>Include relevant hashtags and descriptions</span>
                </li>
              </ul>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-whop-dragon-fire rounded-full mt-2 flex-shrink-0"></div>
                  <span>Content will be reviewed by admins before going public</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-whop-dragon-fire rounded-full mt-2 flex-shrink-0"></div>
                  <span>You'll earn CPM rewards only for approved and published content</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-whop-dragon-fire rounded-full mt-2 flex-shrink-0"></div>
                  <span>Unlisted videos are perfect for brand-safe submissions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}