# 📚 API Documentation - Brand Safe Content Approval App

This document outlines the API structure and data models for the Brand Safe Content Approval Whop App.

## 🏗️ Architecture Overview

The app follows a component-based architecture with the following key areas:
- **Content Submission**: Upload and submit content for review
- **Brand Moderation**: Review, approve, or reject content
- **CPM Payout System**: Track earnings and process payments
- **Analytics**: Performance tracking and reporting
- **Notifications**: Real-time updates and alerts

## 📊 Data Models

### ContentSubmission Interface

```typescript
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
  brandSafetyScore?: number
  potentialIssues?: string[]
  creator: {
    id: string
    username: string
    avatar?: string
  }
}
```

### CPMPayout Interface

```typescript
interface CPMPayout {
  id: string
  contentId: string
  contentTitle: string
  creatorId: string
  creatorName: string
  cpmRate: number
  views: number
  earnings: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  approvedAt?: Date
  paidAt?: Date
  paymentMethod: string
}
```

### Notification Interface

```typescript
interface Notification {
  id: string
  type: 'approval' | 'rejection' | 'payment' | 'reminder' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionText?: string
}
```

### AnalyticsData Interface

```typescript
interface AnalyticsData {
  totalSubmissions: number
  approvedContent: number
  rejectedContent: number
  pendingReview: number
  totalEarnings: number
  averageCPM: number
  totalViews: number
  engagementRate: number
  brandSafetyScore: number
  averageReviewTime: string
}
```

## 🔧 Component Structure

### Core Components

#### 1. ContentSubmissionView
- **Purpose**: Handle content upload and submission
- **Key Features**:
  - Drag-and-drop file upload
  - Content type selection (video, image, text)
  - Brand guidelines compliance check
  - CPM estimation
  - Submission history

#### 2. BrandModerationView
- **Purpose**: Review and moderate submitted content
- **Key Features**:
  - Content review queue
  - Approval/rejection workflow
  - Brand safety scoring
  - Reviewer notes
  - Bulk operations

#### 3. CPMPayoutView
- **Purpose**: Track and manage CPM-based payouts
- **Key Features**:
  - Earnings tracking
  - Payment history
  - Payout settings
  - Performance metrics

#### 4. AnalyticsView
- **Purpose**: Comprehensive analytics and reporting
- **Key Features**:
  - Performance metrics
  - Content analytics
  - Time series data
  - Export functionality

#### 5. NotificationSystem
- **Purpose**: Real-time notifications and alerts
- **Key Features**:
  - Toast notifications
  - Notification center
  - Read/unread status
  - Action buttons

## 🔌 API Endpoints (Mock Structure)

### Content Management

```typescript
// Submit content for review
POST /api/content/submit
Body: {
  title: string
  description: string
  type: 'video' | 'image' | 'text'
  file: File
  brandGuidelines: string[]
  estimatedCPM: number
}

// Get content submissions
GET /api/content/submissions
Query: {
  status?: 'submitted' | 'under_review' | 'approved' | 'rejected'
  creatorId?: string
  limit?: number
  offset?: number
}

// Review content
PUT /api/content/:id/review
Body: {
  status: 'approved' | 'rejected'
  reviewerNotes?: string
  brandSafetyScore?: number
}
```

### Payout Management

```typescript
// Get payout history
GET /api/payouts
Query: {
  creatorId?: string
  status?: 'pending' | 'approved' | 'paid' | 'rejected'
  dateRange?: { start: Date, end: Date }
}

// Process payout
POST /api/payouts/process
Body: {
  payoutIds: string[]
  paymentMethod: string
}

// Update payout settings
PUT /api/payouts/settings
Body: {
  minimumThreshold: number
  autoPayout: boolean
  defaultPaymentMethod: string
}
```

### Analytics

```typescript
// Get analytics data
GET /api/analytics
Query: {
  timeRange: '7d' | '30d' | '90d'
  metric?: string
  groupBy?: 'day' | 'week' | 'month'
}

// Get content performance
GET /api/analytics/content
Query: {
  contentId?: string
  creatorId?: string
  dateRange?: { start: Date, end: Date }
}
```

### Notifications

```typescript
// Get notifications
GET /api/notifications
Query: {
  type?: 'approval' | 'rejection' | 'payment' | 'reminder' | 'info'
  read?: boolean
  limit?: number
}

// Mark notification as read
PUT /api/notifications/:id/read

// Mark all notifications as read
PUT /api/notifications/read-all
```

## 🔐 Authentication & Authorization

### Whop SDK Integration

```typescript
// Initialize Whop SDK
const sdk = new WhopSDKWrapper({
  appId: process.env.WHOP_APP_ID,
  appSecret: process.env.WHOP_APP_SECRET,
  environment: process.env.WHOP_APP_ENV
})

// Get user data
const user = await sdk.getUser()

// Get company data
const company = await sdk.getCompany()

// Check authentication
const isAuthenticated = sdk.isAuthenticated()
```

### User Roles

- **Creator**: Can submit content, view earnings, track performance
- **Moderator**: Can review content, approve/reject submissions
- **Admin**: Full access to all features and settings

## 🎨 UI/UX Guidelines

### Design System

- **Primary Color**: Whop brand colors (`#6366f1`)
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable, accessible components

### Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly**: Large tap targets, easy navigation

## 🔄 State Management

### Local State

- Component-level state using React hooks
- Form state management
- UI state (modals, dropdowns, etc.)

### Global State (Future Enhancement)

- Redux or Zustand for complex state management
- Real-time updates with WebSocket connections
- Caching for better performance

## 📱 Progressive Web App Features

### Service Worker

```typescript
// Register service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

### App Manifest

```json
{
  "name": "Brand Safe Content Approval",
  "short_name": "BrandSafe",
  "description": "Brand-safe content approval system",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#6366f1",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🚀 Performance Optimization

### Code Splitting

```typescript
// Lazy load components
const ContentSubmissionView = lazy(() => import('./components/ContentSubmissionView'))
const BrandModerationView = lazy(() => import('./components/BrandModerationView'))
```

### Image Optimization

- WebP format for better compression
- Lazy loading for images
- Responsive images with different sizes

### Bundle Optimization

- Tree shaking for unused code
- Dynamic imports for large dependencies
- Compression for production builds

## 🔍 Testing Strategy

### Unit Tests

```typescript
// Example test structure
describe('ContentSubmissionView', () => {
  it('should submit content successfully', async () => {
    // Test implementation
  })
  
  it('should validate required fields', () => {
    // Test implementation
  })
})
```

### Integration Tests

- API endpoint testing
- Component integration testing
- End-to-end user flows

## 📈 Monitoring & Analytics

### Error Tracking

- Sentry integration for error monitoring
- Performance monitoring
- User behavior analytics

### Metrics

- Content submission rates
- Approval/rejection ratios
- User engagement metrics
- Performance benchmarks

## 🔒 Security Considerations

### Content Security

- File type validation
- File size limits
- Malware scanning
- Content filtering

### Data Protection

- User data encryption
- Secure file storage
- GDPR compliance
- Data retention policies

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connections tested
- [ ] API endpoints functional
- [ ] Authentication working
- [ ] File uploads working
- [ ] Notifications functional
- [ ] Analytics tracking
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] Error handling implemented

## 📞 Support & Maintenance

### Documentation

- Keep API documentation updated
- Maintain component documentation
- Update deployment guides

### Monitoring

- Set up alerts for critical errors
- Monitor performance metrics
- Track user feedback

### Updates

- Regular dependency updates
- Security patches
- Feature enhancements based on user feedback

---

This documentation provides a comprehensive overview of the Brand Safe Content Approval app's architecture, API structure, and implementation details. Use this as a reference for development, deployment, and maintenance.
