import { useState, useEffect } from 'react'
import { useWhopSDK } from '../lib/whop-sdk'
import { DollarSign, CreditCard, Wallet, TrendingUp, CheckCircle, Clock } from 'lucide-react'

interface PaymentData {
  id: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  date: Date
  type: 'payout' | 'campaign_budget' | 'refund'
  description: string
  creatorId?: string
  campaignId?: string
}

interface PayoutSummary {
  availableBalance: number
  pendingPayouts: number
  totalEarnings: number
  nextPayoutDate: Date
  payoutMethod: string
}

export function WhopPaymentIntegration() {
  const { user, company } = useWhopSDK()
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [payoutSummary, setPayoutSummary] = useState<PayoutSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock Whop payment data - replace with real Whop Payments API calls
    setPayments([
      {
        id: 'pay_1',
        amount: 45.60,
        status: 'completed',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        type: 'payout',
        description: 'CPM earnings for "Product Review - Gaming Chair"',
        creatorId: user?.id
      },
      {
        id: 'pay_2',
        amount: 78.90,
        status: 'pending',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        type: 'payout',
        description: 'CPM earnings for "Brand Campaign - Fitness"',
        creatorId: user?.id
      },
      {
        id: 'pay_3',
        amount: 2500.00,
        status: 'completed',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        type: 'campaign_budget',
        description: 'Campaign budget for Gaming Chair OP Campaign',
        campaignId: 'camp_1'
      }
    ])

    setPayoutSummary({
      availableBalance: 124.50,
      pendingPayouts: 78.90,
      totalEarnings: 2450.75,
      nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      payoutMethod: 'Bank Transfer (****1234)'
    })

    setLoading(false)
  }, [user])

  const initiatePayout = async () => {
    if (!payoutSummary || payoutSummary.availableBalance <= 0) return

    try {
      // Simulate Whop payout API call
      console.log('Initiating Whop payout...')
      // const payout = await whopSDK.payments.createPayout({
      //   amount: payoutSummary.availableBalance,
      //   currency: 'USD',
      //   destination: payoutSummary.payoutMethod
      // })
      
      // Mock success
      setTimeout(() => {
        setPayoutSummary(prev => prev ? {
          ...prev,
          availableBalance: 0,
          pendingPayouts: prev.pendingPayouts + prev.availableBalance
        } : null)
      }, 1000)
    } catch (error) {
      console.error('Payout failed:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'failed':
        return <DollarSign className="w-5 h-5 text-red-500" />
      default:
        return <DollarSign className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payout':
        return 'text-green-600'
      case 'campaign_budget':
        return 'text-blue-600'
      case 'refund':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whop-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payout Summary */}
      {payoutSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">${payoutSummary.availableBalance.toFixed(2)}</p>
              </div>
              <Wallet className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-gray-900">${payoutSummary.pendingPayouts.toFixed(2)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${payoutSummary.totalEarnings.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Payout</p>
                <p className="text-lg font-bold text-gray-900">
                  {payoutSummary.nextPayoutDate.toLocaleDateString()}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Payout Actions */}
      {payoutSummary && payoutSummary.availableBalance > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ready for Payout</h3>
              <p className="text-sm text-gray-600">
                {payoutSummary.payoutMethod} • Next payout: {payoutSummary.nextPayoutDate.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={initiatePayout}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Request Payout (${payoutSummary.availableBalance.toFixed(2)})
            </button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          <p className="text-sm text-gray-600">Track your earnings and payouts</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(payment.status)}
                  <div>
                    <p className="font-medium text-gray-900">{payment.description}</p>
                    <p className="text-sm text-gray-600">
                      {payment.date.toLocaleDateString()} • 
                      <span className={`ml-1 font-medium ${getTypeColor(payment.type)}`}>
                        {payment.type.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    payment.type === 'payout' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {payment.type === 'payout' ? '+' : ''}${payment.amount.toFixed(2)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Whop Payment Features */}
      <div className="bg-gradient-to-r from-whop-primary/10 to-whop-secondary/10 rounded-2xl p-6 border border-whop-primary/20">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-whop-primary to-whop-secondary rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Powered by Whop Payments</h3>
            <p className="text-sm text-gray-600">Secure, fast, and reliable payment processing</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">PCI Level 1 Certified</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">Global Payouts</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">Multiple Payment Methods</span>
          </div>
        </div>
      </div>
    </div>
  )
}
