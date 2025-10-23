import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Upload, Eye, DollarSign, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Submission {
  id: string
  title: string
  description: string
  status: string
  visibility: string
  created_at: string
  approved_at: string | null
  rejected_at: string | null
  review_note: string | null
  campaign_name: string
  cpm_cents: number
  views: number
}

interface EarningsSummary {
  period: string
  totalEarnings: number
  totalViews: number
  submissions: Array<{
    submission_id: string
    title: string
    views: number
    earnings_cents: number
    campaign_name: string
  }>
  summary: {
    totalEarningsCents: number
    totalViews: number
    submissionCount: number
  }
}

export default function MemberExperience() {
  const router = useRouter()
  const { experienceId } = router.query
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    file: null as File | null
  })

  useEffect(() => {
    if (experienceId) {
      loadSubmissions()
      loadEarnings()
    }
  }, [experienceId])

  useEffect(() => {
    if (selectedPeriod) {
      loadEarnings()
    }
  }, [selectedPeriod])

  const loadSubmissions = async () => {
    try {
      const response = await fetch('/api/me/submissions')
      if (!response.ok) throw new Error('Failed to load submissions')
      const data = await response.json()
      setSubmissions(data)
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEarnings = async () => {
    if (!selectedPeriod) return
    
    try {
      const response = await fetch(`/api/earnings/summary?period=${selectedPeriod}&userId=user-123`)
      if (!response.ok) throw new Error('Failed to load earnings')
      const data = await response.json()
      setEarnings(data)
    } catch (error) {
      console.error('Error loading earnings:', error)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.title || !uploadForm.file) return

    try {
      // Mock file upload - in real implementation, upload to storage first
      const storageKey = `uploads/${Date.now()}_${uploadForm.file.name}`
      
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          storageKey,
          thumbKey: `thumbs/${Date.now()}_thumb.jpg`
        })
      })

      if (!response.ok) throw new Error('Failed to submit content')

      await loadSubmissions()
      setUploadForm({ title: '', description: '', file: null })
    } catch (error) {
      console.error('Error uploading:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending_review':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'flagged':
        return <XCircle className="w-4 h-4 text-orange-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900/20 text-green-400 border-green-500'
      case 'rejected':
        return 'bg-red-900/20 text-red-400 border-red-500'
      case 'pending_review':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-500'
      case 'flagged':
        return 'bg-orange-900/20 text-orange-400 border-orange-500'
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-500'
    }
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Generate period options (last 12 months)
  const generatePeriodOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      options.push(period)
    }
    return options
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading experience...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-whop-dragon-fire">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold">Content Creator Hub</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Upload Content</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
                  placeholder="Enter content title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
                  rows={3}
                  placeholder="Describe your content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video File *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!uploadForm.title || !uploadForm.file}
                className="w-full px-4 py-2 bg-whop-dragon-fire hover:bg-whop-dragon-fire/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Content</span>
              </button>
            </form>
          </div>
        </div>

        {/* My Submissions Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">My Submissions</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-300">Thumb</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{submission.title}</div>
                          <div className="text-sm text-gray-400 truncate max-w-xs">{submission.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {submission.campaign_name || 'No Campaign'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(submission.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(submission.status)}`}>
                          {submission.status === 'pending_review' ? 'Under Review' :
                           submission.status === 'flagged' ? 'Needs Changes' :
                           submission.status === 'approved' ? 'Approved & Public' :
                           submission.status.replace('_', ' ')}
                        </span>
                      </div>
                      {submission.review_note && (
                        <div className="text-xs text-gray-400 mt-1">{submission.review_note}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {submission.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {submission.status === 'approved' && submission.visibility === 'public' ? 
                        formatCurrency(submission.views * submission.cpm_cents / 1000) : 
                        '$0.00'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(submission.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Earnings Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Earnings</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-whop-dragon-fire focus:border-transparent"
              >
                <option value="">Select a period</option>
                {generatePeriodOptions().map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>

            {earnings && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-medium text-gray-300">Total Earnings</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(earnings.summary.totalEarningsCents)}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium text-gray-300">Total Views</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {earnings.summary.totalViews.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Submissions</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {earnings.summary.submissionCount}
                    </div>
                  </div>
                </div>

                {earnings.submissions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Breakdown by Submission</h3>
                    <div className="space-y-2">
                      {earnings.submissions.map((submission) => (
                        <div key={submission.submission_id} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                          <div>
                            <div className="font-medium text-white">{submission.title}</div>
                            <div className="text-sm text-gray-400">{submission.campaign_name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-white">{formatCurrency(submission.earnings_cents)}</div>
                            <div className="text-sm text-gray-400">{submission.views.toLocaleString()} views</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
