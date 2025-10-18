import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  ThumbsUp
} from 'lucide-react'

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

interface ContentPerformance {
  id: string
  title: string
  views: number
  likes: number
  shares: number
  engagement: number
  cpmEarnings: number
  approvalDate: Date
}

export function CPMPayoutView() {
  const { company } = useWhopSDK()
  const [payouts, setPayouts] = useState<CPMPayout[]>([])
  const [performance, setPerformance] = useState<ContentPerformance[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [pendingPayouts, setPendingPayouts] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      // Mock CPM payout data
      const mockPayouts: CPMPayout[] = [
        {
          id: '1',
          contentId: 'content-1',
          contentTitle: 'Product Demo Video',
          creatorId: 'creator-1',
          creatorName: 'alice_creator',
          cpmRate: 2.50,
          views: 15420,
          earnings: 38.55,
          status: 'paid',
          approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Whop Wallet'
        },
        {
          id: '2',
          contentId: 'content-2',
          contentTitle: 'Lifestyle Image Post',
          creatorId: 'creator-2',
          creatorName: 'bob_photographer',
          cpmRate: 1.80,
          views: 8930,
          earnings: 16.07,
          status: 'approved',
          approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Whop Wallet'
        },
        {
          id: '3',
          contentId: 'content-3',
          contentTitle: 'Educational Content',
          creatorId: 'creator-3',
          creatorName: 'charlie_educator',
          cpmRate: 1.20,
          views: 12500,
          earnings: 15.00,
          status: 'pending',
          paymentMethod: 'Whop Wallet'
        }
      ]

      const mockPerformance: ContentPerformance[] = [
        {
          id: '1',
          title: 'Product Demo Video',
          views: 15420,
          likes: 892,
          shares: 156,
          engagement: 6.8,
          cpmEarnings: 38.55,
          approvalDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          title: 'Lifestyle Image Post',
          views: 8930,
          likes: 445,
          shares: 78,
          engagement: 5.9,
          cpmEarnings: 16.07,
          approvalDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Educational Content',
          views: 12500,
          likes: 623,
          shares: 134,
          engagement: 6.1,
          cpmEarnings: 15.00,
          approvalDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]

      setPayouts(mockPayouts)
      setPerformance(mockPerformance)
      setTotalEarnings(mockPayouts.reduce((sum, payout) => sum + payout.earnings, 0))
      setPendingPayouts(mockPayouts.filter(p => p.status === 'pending' || p.status === 'approved').length)
      setLoading(false)
    }

    loadData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'paid':
        return <DollarSign className="w-4 h-4 text-blue-500" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whop-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">CPM Payout Dashboard</h1>
          <p className="text-gray-600">
            Track your earnings from approved brand-safe content
          </p>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
              <p className="text-2xl font-bold text-gray-900">{pendingPayouts}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Content</p>
              <p className="text-2xl font-bold text-gray-900">{performance.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <Eye className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Content Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPM Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performance.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Eye className="w-4 h-4 mr-1 text-gray-400" />
                      {item.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <ThumbsUp className="w-4 h-4 mr-1 text-gray-400" />
                      {item.engagement}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      ${item.cpmEarnings.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {item.approvalDate.toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payout History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {payouts.map((payout) => (
            <div key={payout.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{payout.contentTitle}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                      {getStatusIcon(payout.status)}
                      <span className="ml-1 capitalize">{payout.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Creator:</span> {payout.creatorName}
                    </div>
                    <div>
                      <span className="font-medium">CPM Rate:</span> ${payout.cpmRate}
                    </div>
                    <div>
                      <span className="font-medium">Views:</span> {payout.views.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Earnings:</span> 
                      <span className="font-bold text-green-600 ml-1">${payout.earnings.toFixed(2)}</span>
                    </div>
                  </div>

                  {payout.approvedAt && (
                    <div className="mt-2 text-sm text-gray-500">
                      Approved: {payout.approvedAt.toLocaleDateString()}
                    </div>
                  )}
                  
                  {payout.paidAt && (
                    <div className="mt-2 text-sm text-gray-500">
                      Paid: {payout.paidAt.toLocaleDateString()} via {payout.paymentMethod}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Payment Settings</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Payment Method
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary">
                <option>Whop Wallet</option>
                <option>PayPal</option>
                <option>Bank Transfer</option>
                <option>Crypto Wallet</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Payout Threshold
              </label>
              <input
                type="number"
                defaultValue={10.00}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-whop-primary"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoPayout"
                defaultChecked
                className="h-4 w-4 text-whop-primary focus:ring-whop-primary border-gray-300 rounded"
              />
              <label htmlFor="autoPayout" className="ml-2 block text-sm text-gray-900">
                Enable automatic payouts when threshold is reached
              </label>
            </div>

            <button className="bg-whop-primary text-white px-6 py-2 rounded-md hover:bg-whop-primary/90 transition-colors">
              Update Payment Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
