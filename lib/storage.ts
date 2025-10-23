// Storage utilities for secure content access
import { query } from '../api/database'

export interface StorageConfig {
  bucket: string
  region: string
  accessKey: string
  secretKey: string
}

export class SecureStorage {
  private config: StorageConfig

  constructor(config: StorageConfig) {
    this.config = config
  }

  /**
   * Generate signed URL for private content access
   */
  async generateSignedUrl(storageKey: string, expiresIn: number = 3600): Promise<string> {
    // Mock implementation - replace with actual S3/CloudFront signed URL generation
    const baseUrl = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com`
    const timestamp = Math.floor(Date.now() / 1000) + expiresIn
    const signature = this.generateSignature(storageKey, timestamp)
    
    return `${baseUrl}/${storageKey}?X-Amz-Expires=${expiresIn}&X-Amz-Signature=${signature}`
  }

  /**
   * Generate public URL for approved content
   */
  generatePublicUrl(storageKey: string): string {
    // For approved content, use public CDN URL
    return `https://cdn.${this.config.bucket}.com/${storageKey}`
  }

  /**
   * Check if content should be served via signed URL or public URL
   */
  async getContentUrl(submissionId: string, userId?: string): Promise<{ url: string; isPublic: boolean }> {
    try {
      const result = await query(`
        SELECT 
          cs.storage_key,
          cs.status,
          cs.visibility,
          cs.creator_id
        FROM content_submissions cs
        WHERE cs.id = $1
      `, [submissionId])

      if (result.rows.length === 0) {
        throw new Error('Submission not found')
      }

      const submission = result.rows[0]

      // Check if content is public
      if (submission.status === 'approved' && submission.visibility === 'public') {
        return {
          url: this.generatePublicUrl(submission.storage_key),
          isPublic: true
        }
      }

      // Check if user is the creator
      if (userId && submission.creator_id === userId) {
        return {
          url: await this.generateSignedUrl(submission.storage_key),
          isPublic: false
        }
      }

      // For private content, require authentication
      throw new Error('Access denied - content is private')
    } catch (error) {
      console.error('Error getting content URL:', error)
      throw error
    }
  }

  /**
   * Generate signature for signed URLs (mock implementation)
   */
  private generateSignature(storageKey: string, timestamp: number): string {
    // Mock signature generation - replace with actual AWS signature v4
    const message = `${storageKey}${timestamp}${this.config.secretKey}`
    return Buffer.from(message).toString('base64').slice(0, 32)
  }

  /**
   * Upload file to storage (mock implementation)
   */
  async uploadFile(file: File, key: string): Promise<{ success: boolean; key: string }> {
    // Mock upload - replace with actual S3 upload
    console.log(`Uploading file ${file.name} to ${key}`)
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      key
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(key: string): Promise<{ success: boolean }> {
    // Mock delete - replace with actual S3 delete
    console.log(`Deleting file ${key}`)
    
    return {
      success: true
    }
  }

  /**
   * Generate thumbnail URL
   */
  generateThumbnailUrl(thumbKey: string, isPublic: boolean = false): string {
    if (isPublic) {
      return `https://cdn.${this.config.bucket}.com/thumbs/${thumbKey}`
    } else {
      return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/thumbs/${thumbKey}`
    }
  }
}

// Default storage configuration
const defaultStorageConfig: StorageConfig = {
  bucket: process.env.STORAGE_BUCKET || 'brand-safe-content',
  region: process.env.STORAGE_REGION || 'us-east-1',
  accessKey: process.env.STORAGE_ACCESS_KEY || '',
  secretKey: process.env.STORAGE_SECRET_KEY || ''
}

export const storage = new SecureStorage(defaultStorageConfig)
