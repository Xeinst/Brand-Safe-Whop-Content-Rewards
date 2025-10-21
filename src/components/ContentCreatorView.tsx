import { useState, useEffect } from 'react'
import { extractYouTubeVideoId } from '../lib/youtube'
import { Video, FileText, DollarSign, Clock, CheckCircle, XCircle, Plus, Star, Users } from 'lucide-react'

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
}

export function ContentCreatorView() {
  const [activeTab, setActiveTab] = useState<'rewards' | 'submissions' | 'submit'>('rewards')
  const [activeRewards, setActiveRewards] = useState<ContentReward[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedReward, setSelectedReward] = useState<string>('')
  const [currentSubmission, setCurrentSubmission] = useState<Partial<Submission>>({
    title: '',
    description: '',
    privateVideoLink: '',
    publicVideoLink: null,
    thumbnail: ''
  })
  const [ytPreview, setYtPreview] = useState<{ title: string; thumbnail: string } | null>(null)
  const [ytError, setYtError] = useState<string | null>(null)

  useEffect(() => {
    // Mock data - replace with real API calls
    setActiveRewards([
      {
        id: '1',
        name: 'Gaming Chair Review Campaign',
        description: 'Create a review video of our premium gaming chairs. Show the comfort, adjustability, and build quality.',
        cpm: 5.00,
        requirements: [
          'Minimum 2 minutes duration',
          'Show the chair from multiple angles',
          'Include your honest opinion',
          'Mention key features: lumbar support, armrests, height adjustment'
        ],
        status: 'active'
      },
      {
        id: '2',
        name: 'Tech Unboxing Video',
        description: 'Unbox and showcase our latest wireless earbuds. Highlight the packaging, accessories, and sound quality.',
        cpm: 3.50,
        requirements: [
          'Show unboxing process',
          'Demonstrate sound quality',
          'Compare with other earbuds if possible',
          'Minimum 3 minutes duration'
        ],
        status: 'active'
      }
    ])
  }, [])

  const handleLinkChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const link = event.target.value
    setCurrentSubmission(prev => ({ ...prev, privateVideoLink: link }))

    setYtPreview(null)
    setYtError(null)

    const videoId = extractYouTubeVideoId(link)
    if (!videoId) {
      setYtError('Enter a valid YouTube link (watch, shorts, or youtu.be)')
      return
    }

    // Call secure serverless function
    const resp = await fetch(`/api/youtube-meta?url=${encodeURIComponent(link)}`)
    if (!resp.ok) {
      setYtError('Could not fetch video details. Check the link or quota.')
      return
    }

    const meta = await resp.json()
    if (meta.privacyStatus && meta.privacyStatus !== 'private' && meta.privacyStatus !== 'unlisted') {
      // For approval we expect private/unlisted initially
    }

    setYtPreview({ title: meta.title, thumbnail: meta.thumbnailUrl })
    setCurrentSubmission(prev => ({ ...prev, thumbnail: meta.thumbnailUrl }))
  }

  const handleSubmit = () => {
    if (!currentSubmission.privateVideoLink) {
      alert('Please provide a video link')
      return
    }

    // Block submit if link invalid
    const videoId = extractYouTubeVideoId(currentSubmission.privateVideoLink)
    if (!videoId) {
      alert('Please provide a valid YouTube link before submitting')
      return
    }

    // Use the first available reward or create a default one
    const reward = activeRewards[0] || {
      id: 'default',
      name: 'Content Submission',
      cpm: 4.00
    }

    const newSubmission: Submission = {
      id: Date.now().toString(),
      rewardId: reward.id,
      title: ytPreview?.title || 'Video Submission',
      description: '',
      privateVideoLink: currentSubmission.privateVideoLink!,
      publicVideoLink: null,
      thumbnail: currentSubmission.thumbnail || '',
      status: 'submitted',
      submittedAt: new Date(),
      publishedAt: null,
      estimatedEarnings: reward.cpm * 1000, // Assuming 1000 views for estimation
      actualViews: 0
    }

    setSubmissions(prev => [newSubmission, ...prev])
    
    // Reset form
    setCurrentSubmission({
      title: '',
      description: '',
      privateVideoLink: '',
      publicVideoLink: null,
      thumbnail: ''
    })
    setYtPreview(null)
    setYtError(null)

    alert('Unlisted video submitted for approval! You will be notified once it\'s reviewed. After approval, make your video public and we\'ll start tracking views.')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'published':
        return <DollarSign className="w-5 h-5 text-green-500" />
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
      case 'published':
        return 'bg-blue-100 text-blue-800'
      case 'submitted':
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
            <button
              onClick={() => setActiveTab('submit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'submit'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}
            >
              Submit Unreleased Content
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'rewards' && (
          <div className="space-y-6">
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
              {activeRewards.length > 0 && (
                <div className="space-y-4">
                  {activeRewards.map((reward) => (
                    <div key={reward.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-2">{reward.name}</h3>
                      <div className="text-gray-400 mb-4">${reward.cpm} CPM</div>
                      
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

        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Filter and Action Bar */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-600 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Status
                  </button>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="bg-gray-800 border-b border-gray-700">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium">
                  <div className="flex items-center">
                    Title <MoreVertical className="w-4 h-4 ml-1" />
                  </div>
                  <div className="flex items-center">
                    Status <MoreVertical className="w-4 h-4 ml-1" />
                  </div>
                  <div className="flex items-center">
                    Total views <MoreVertical className="w-4 h-4 ml-1" />
                  </div>
                  <div className="flex items-center">
                    Submission <MoreVertical className="w-4 h-4 ml-1" />
                  </div>
                  <div className="flex items-center">
                    Reward rate <MoreVertical className="w-4 h-4 ml-1" />
                  </div>
                  <div className="flex items-center">
                    Paid <MoreVertical className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
              {submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <div className="w-16 h-16 bg-orange-500 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">$</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    No submissions <span className="text-yellow-400">here</span>
                  </h2>
                  <p className="text-gray-400">
                    Start submitting content to earn money!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border-b border-gray-700 py-4">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <div className="flex items-center">
                          <span className="text-white font-medium">{submission.title}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(submission.status)}`}>
                            {submission.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {submission.actualViews.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          {submission.submittedAt?.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          ${submission.estimatedEarnings.toFixed(2)}
                        </div>
                        <div className="flex items-center">
                          <span className={submission.status === 'published' ? 'text-green-400' : 'text-gray-400'}>
                            {submission.status === 'published' ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'submit' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Submit Unreleased Content</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Unlisted Video Link *
                  </label>
                  <input
                    type="url"
                    value={currentSubmission.privateVideoLink || ''}
                    onChange={handleLinkChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 text-white"
                    placeholder="https://youtube.com/watch?v=... (unlisted video)"
                  />
                  {ytError && (
                    <div className="mt-3 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                      <p className="text-sm text-red-400 flex items-center space-x-2">
                        <XCircle className="w-4 h-4" />
                        <span>{ytError}</span>
                      </p>
                    </div>
                  )}
                  {ytPreview && (
                    <div className="mt-3 p-4 bg-green-900/50 border border-green-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img src={ytPreview.thumbnail} alt={ytPreview.title} className="w-20 h-11 rounded-lg object-cover border border-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-300 truncate">{ytPreview.title}</p>
                          <p className="text-xs text-green-400">Video validated successfully</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                    Submit a link to your unlisted video for review. After approval, make it public and we'll track views automatically.
                  </p>
                </div>
                
                <button
                  onClick={handleSubmit}
                  className="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Submit Unlisted Video</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
