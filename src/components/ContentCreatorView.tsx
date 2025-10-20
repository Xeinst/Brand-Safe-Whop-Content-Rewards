import { useState, useEffect } from 'react'
import { extractYouTubeVideoId } from '../lib/youtube'
import { Video, FileText, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react'

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
    if (!selectedReward || !currentSubmission.title || !currentSubmission.privateVideoLink) {
      alert('Please fill in all required fields and provide a private video link')
      return
    }

    // Block submit if link invalid
    const videoId = extractYouTubeVideoId(currentSubmission.privateVideoLink)
    if (!videoId) {
      alert('Please provide a valid YouTube link before submitting')
      return
    }

    const reward = activeRewards.find(r => r.id === selectedReward)
    if (!reward) return

    const newSubmission: Submission = {
      id: Date.now().toString(),
      rewardId: selectedReward,
      title: currentSubmission.title!,
      description: currentSubmission.description || '',
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
    setSelectedReward('')

    alert('Private video link submitted for approval! You will be notified once it\'s reviewed. After approval, make your video public and we\'ll start tracking views.')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Content Creator Portal</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Rewards */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Content Rewards</h2>
              <div className="space-y-4">
                {activeRewards.map((reward) => (
                  <div key={reward.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.name}</h3>
                        <p className="text-gray-600 mb-4">{reward.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500">CPM: <span className="font-semibold text-green-600">${reward.cpm}</span></span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {reward.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {reward.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => setSelectedReward(reward.id)}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedReward === reward.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedReward === reward.id ? 'Selected' : 'Select This Reward'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Form */}
            {selectedReward && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Content</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Title *
                    </label>
                    <input
                      type="text"
                      value={currentSubmission.title || ''}
                      onChange={(e) => setCurrentSubmission(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter a descriptive title for your content"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={currentSubmission.description || ''}
                      onChange={(e) => setCurrentSubmission(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your content and key points covered"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Private Video Link *
                    </label>
                    <input
                      type="url"
                      value={currentSubmission.privateVideoLink || ''}
                      onChange={handleLinkChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=... or https://tiktok.com/@user/video/..."
                    />
                  {ytError && (
                    <p className="text-xs text-red-600 mt-1">{ytError}</p>
                  )}
                  {ytPreview && (
                    <div className="flex items-center space-x-3 mt-2">
                      <img src={ytPreview.thumbnail} alt={ytPreview.title} className="w-16 h-9 rounded object-cover border" />
                      <p className="text-sm text-gray-700 truncate">{ytPreview.title}</p>
                    </div>
                  )}
                    <p className="text-xs text-gray-500 mt-1">
                      Submit a link to your private video for review. After approval, make it public and we'll track views automatically.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Approval Process</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      Your private video will be reviewed for brand safety and quality. Once approved, make your video public and we'll automatically track views and calculate your CPM earnings.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Private Video Link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submissions History */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Submissions</h2>
              {submissions.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No submissions yet</p>
                  <p className="text-sm text-gray-500">Submit content to start earning rewards</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(submission.status)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {submission.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {submission.submittedAt?.toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(submission.status)}`}>
                              {submission.status.replace('_', ' ')}
                            </span>
                            {submission.status === 'published' && (
                              <span className="text-xs text-green-600 font-medium">
                                ${submission.estimatedEarnings.toFixed(2)} earned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Earnings Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earned:</span>
                  <span className="font-semibold text-green-600">
                    ${submissions.filter(s => s.status === 'published').reduce((sum, s) => sum + s.estimatedEarnings, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Approval:</span>
                  <span className="font-semibold text-yellow-600">
                    {submissions.filter(s => s.status === 'submitted' || s.status === 'pending_approval').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Published:</span>
                  <span className="font-semibold text-green-600">
                    {submissions.filter(s => s.status === 'published').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
