import React, { useState, useRef } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { 
  Upload, 
  Video, 
  Image, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Eye,
  Shield
} from 'lucide-react'

interface ContentSubmission {
  id: string
  title: string
  description: string
  type: 'video' | 'image' | 'text'
  file?: File
  url?: string
  brandGuidelines: string[]
  estimatedCPM: number
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  submittedAt?: Date
  reviewedAt?: Date
  reviewerNotes?: string
}

export function ContentSubmissionView() {
  const { user, company } = useWhopSDK()
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([])
  const [currentSubmission, setCurrentSubmission] = useState<Partial<ContentSubmission>>({
    title: '',
    description: '',
    type: 'video',
    brandGuidelines: [],
    estimatedCPM: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const brandGuidelines = [
    'No profanity or offensive language',
    'No violence or harmful content',
    'No misleading claims about products',
    'Must align with brand values',
    'No competitor mentions',
    'Appropriate for all audiences',
    'No controversial political content',
    'No discriminatory content'
  ]

  const handleFileUpload = (file: File) => {
    if (file) {
      setCurrentSubmission(prev => ({
        ...prev,
        file,
        url: URL.createObjectURL(file)
      }))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!currentSubmission.title || !currentSubmission.description) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newSubmission: ContentSubmission = {
      id: Date.now().toString(),
      ...currentSubmission,
      status: 'submitted',
      submittedAt: new Date()
    } as ContentSubmission

    setSubmissions(prev => [newSubmission, ...prev])
    setCurrentSubmission({
      title: '',
      description: '',
      type: 'video',
      brandGuidelines: [],
      estimatedCPM: 0
    })
    setIsSubmitting(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'under_review':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Content Submission</h1>
          <p className="text-gray-600">
            Submit your content for brand-safe approval and earn CPM rewards
          </p>
        </div>
      </div>

      {/* Submission Form */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Submit New Content</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { type: 'video', icon: Video, label: 'Video' },
                { type: 'image', icon: Image, label: 'Image' },
                { type: 'text', icon: FileText, label: 'Text Post' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setCurrentSubmission(prev => ({ ...prev, type: type as any }))}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    currentSubmission.type === type
                      ? 'border-whop-primary bg-whop-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Content
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-whop-primary bg-whop-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {currentSubmission.url ? (
                <div className="space-y-4">
                  {currentSubmission.type === 'video' ? (
                    <video
                      src={currentSubmission.url}
                      className="max-w-full max-h-48 mx-auto rounded-lg"
                      controls
                    />
                  ) : currentSubmission.type === 'image' ? (
                    <img
                      src={currentSubmission.url}
                      alt="Preview"
                      className="max-w-full max-h-48 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <FileText className="w-12 h-12 mx-auto text-gray-400" />
                    </div>
                  )}
                  <p className="text-sm text-gray-600">{currentSubmission.file?.name}</p>
                  <button
                    onClick={() => setCurrentSubmission(prev => ({ ...prev, file: undefined, url: undefined }))}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Drag and drop your {currentSubmission.type} here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-whop-primary hover:text-whop-primary/80 font-medium"
                      >
                        browse files
                      </button>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports MP4, MOV, AVI for videos; JPG, PNG, GIF for images
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={currentSubmission.type === 'video' ? 'video/*' : currentSubmission.type === 'image' ? 'image/*' : '.txt,.md'}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Content Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={currentSubmission.title}
                onChange={(e) => setCurrentSubmission(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
                placeholder="Enter content title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated CPM ($)
              </label>
              <input
                type="number"
                value={currentSubmission.estimatedCPM}
                onChange={(e) => setCurrentSubmission(prev => ({ ...prev, estimatedCPM: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={currentSubmission.description}
              onChange={(e) => setCurrentSubmission(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
              placeholder="Describe your content and how it aligns with brand values"
            />
          </div>

          {/* Brand Guidelines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Brand Guidelines Compliance
            </label>
            <div className="grid grid-cols-2 gap-3">
              {brandGuidelines.map((guideline, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={currentSubmission.brandGuidelines?.includes(guideline)}
                    onChange={(e) => {
                      const guidelines = currentSubmission.brandGuidelines || []
                      if (e.target.checked) {
                        setCurrentSubmission(prev => ({
                          ...prev,
                          brandGuidelines: [...guidelines, guideline]
                        }))
                      } else {
                        setCurrentSubmission(prev => ({
                          ...prev,
                          brandGuidelines: guidelines.filter(g => g !== guideline)
                        }))
                      }
                    }}
                    className="h-4 w-4 text-whop-primary focus:ring-whop-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{guideline}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Content will be reviewed for brand safety before approval</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !currentSubmission.title || !currentSubmission.description}
              className="bg-whop-primary text-white px-6 py-2 rounded-md hover:bg-whop-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>Submit for Review</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Submission History */}
      {submissions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Your Submissions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{submission.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{submission.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {submission.type}</span>
                      <span>CPM: ${submission.estimatedCPM}</span>
                      <span>Submitted: {submission.submittedAt?.toLocaleDateString()}</span>
                    </div>
                    {submission.reviewerNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Reviewer Notes:</strong> {submission.reviewerNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
