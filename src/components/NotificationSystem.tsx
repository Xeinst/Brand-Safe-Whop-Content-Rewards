import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Info,
  Clock,
  DollarSign,
  X
} from 'lucide-react'

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

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'approval',
        title: 'Content Approved! 🎉',
        message: 'Your "Product Demo Video" has been approved and is now live. You\'ve earned $38.55 in CPM rewards!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        actionUrl: '/payouts',
        actionText: 'View Earnings'
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Processed 💰',
        message: 'Your payout of $54.62 has been processed and sent to your Whop Wallet.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: false,
        actionUrl: '/payouts',
        actionText: 'View Details'
      },
      {
        id: '3',
        type: 'rejection',
        title: 'Content Needs Revision',
        message: 'Your "Lifestyle Post" was rejected due to lighting quality. Please review the feedback and resubmit.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true,
        actionUrl: '/submit',
        actionText: 'Resubmit'
      },
      {
        id: '4',
        type: 'reminder',
        title: 'Content Under Review',
        message: 'Your "Educational Content" is currently being reviewed by our brand safety team.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true
      },
      {
        id: '5',
        type: 'info',
        title: 'New Brand Guidelines',
        message: 'Updated brand guidelines are now available. Please review them before submitting new content.',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        read: true,
        actionUrl: '/guidelines',
        actionText: 'View Guidelines'
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejection':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'payment':
        return <DollarSign className="w-5 h-5 text-blue-500" />
      case 'reminder':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-gray-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }


  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-whop-primary rounded-md"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-whop-primary hover:text-whop-primary/80"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.actionUrl && notification.actionText && (
                        <button className="mt-2 text-sm text-whop-primary hover:text-whop-primary/80 font-medium">
                          {notification.actionText} →
                        </button>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <button className="w-full text-sm text-whop-primary hover:text-whop-primary/80 font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Toast notification component for real-time updates
export function ToastNotification({ notification, onClose }: { 
  notification: Notification | null
  onClose: () => void 
}) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000) // Auto-close after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [notification, onClose])

  if (!notification) return null

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejection':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'payment':
        return <DollarSign className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getToastColor = (type: string) => {
    switch (type) {
      case 'approval':
        return 'bg-green-50 border-green-200'
      case 'rejection':
        return 'bg-red-50 border-red-200'
      case 'payment':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`${getToastColor(notification.type)} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getToastIcon(notification.type)}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {notification.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
