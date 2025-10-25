import { useState, useRef } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { campaignService } from '../services/campaignService'
import { Campaign, CampaignSubmission } from '../types/campaign'
import { Upload, X, AlertCircle, CheckCircle, Calendar, Award } from 'lucide-react'

interface ContentUploadProps {
  campaign: Campaign
  onClose: () => void
  onUploadSuccess: (submission: CampaignSubmission) => void
}

export function ContentUpload({ campaign, onClose, onUploadSuccess }: ContentUploadProps) {
  const { user } = useWhopSDK()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'image' as 'image' | 'video' | 'text',
    contentUrl: '',
    uploadType: 'file' as 'file' | 'link' // New field for upload type
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = campaign.allowedContentTypes
    const fileType = file.type.startsWith('image/') ? 'image' : 
                   file.type.startsWith('video/') ? 'video' : 'text'
    
    if (!allowedTypes.includes(fileType)) {
      setError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`)
      return
    }

    // Validate file size (example: 10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('File size too large. Maximum size is 10MB.')
      return
    }

    setFormData(prev => ({
      ...prev,
      contentType: fileType,
      contentUrl: URL.createObjectURL(file), // In real app, upload to server
      uploadType: 'file'
    }))
    setError(null)
  }

  const handleLinkInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value
    setFormData(prev => ({
      ...prev,
      contentUrl: url,
      uploadType: 'link'
    }))
    
    // Basic URL validation
    if (url && !isValidUrl(url)) {
      setError('Please enter a valid URL')
    } else {
      setError(null)
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('User not authenticated')
      return
    }

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.contentUrl) {
      setError(formData.uploadType === 'file' ? 'Please select a file to upload' : 'Please enter a video link')
      return
    }

    try {
      setUploading(true)
      setError(null)
      setUploadProgress(0)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const submission = await campaignService.submitToCampaign(
        campaign.id,
        user.id,
        {
          contentUrl: formData.contentUrl,
          fileUrl: formData.contentUrl, // Same as contentUrl for now
          contentType: formData.contentType,
          title: formData.title,
          description: formData.description,
          uploadType: formData.uploadType
        }
      )

      clearInterval(progressInterval)
      setUploadProgress(100)
      setSuccess(true)
      
      setTimeout(() => {
        onUploadSuccess(submission)
        onClose()
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Successful!</h3>
            <p className="text-gray-600 mb-4">
              Your {formData.uploadType === 'file' ? 'content' : 'video link'} has been submitted to <strong>{campaign.name}</strong> and is now under review.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800">
                <strong>Reward:</strong> {campaign.rewardPerUpload} points will be awarded upon approval
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload Content</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Campaign Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">{campaign.name}</h3>
          <p className="text-sm text-blue-800 mb-2">{campaign.description}</p>
          <div className="flex items-center space-x-4 text-sm text-blue-700">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-1" />
              <span>{campaign.rewardPerUpload} points</span>
            </div>
          </div>
        </div>

        {/* Brand Guidelines */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-yellow-900 mb-2">Brand Guidelines</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            {campaign.brandGuidelines.map((guideline, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Upload Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, uploadType: 'file', contentUrl: '' }))}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.uploadType === 'file'
                    ? 'border-whop-primary bg-whop-primary/5 text-whop-primary'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto mb-2" />
                <div className="text-sm font-medium">Upload File</div>
                <div className="text-xs text-gray-500">MP4, Image files</div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, uploadType: 'link', contentUrl: '' }))}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.uploadType === 'link'
                    ? 'border-whop-primary bg-whop-primary/5 text-whop-primary'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className="text-sm font-medium">Video Link</div>
                <div className="text-xs text-gray-500">Unlisted YouTube, Vimeo</div>
              </button>
            </div>
          </div>

          {/* File Upload */}
          {formData.uploadType === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept={campaign.allowedContentTypes.includes('image') ? 'image/*' : '' + 
                         campaign.allowedContentTypes.includes('video') ? 'video/*' : ''}
                  className="hidden"
                />
                {formData.contentUrl ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                    <p className="text-sm text-gray-600">File selected</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-whop-primary hover:text-whop-primary/80"
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-whop-primary hover:text-whop-primary/80"
                    >
                      Browse files
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Allowed types: {campaign.allowedContentTypes.join(', ')} • Max size: 10MB
              </p>
            </div>
          )}

          {/* Video Link Input */}
          {formData.uploadType === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Link
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.contentUrl}
                  onChange={handleLinkInput}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                />
                {formData.contentUrl && isValidUrl(formData.contentUrl) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter an unlisted YouTube or Vimeo video link
              </p>
              {formData.contentUrl && isValidUrl(formData.contentUrl) && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-800">
                    ✓ Valid video link detected
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
              placeholder="Enter a title for your content"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
              rows={3}
              placeholder="Describe your content (optional)"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-whop-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !formData.title.trim() || !formData.contentUrl}
              className="flex-1 px-4 py-2 bg-whop-primary text-white rounded-md hover:bg-whop-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Submitting...' : formData.uploadType === 'file' ? 'Upload Content' : 'Submit Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
