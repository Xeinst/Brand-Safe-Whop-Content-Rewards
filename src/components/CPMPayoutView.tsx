import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { useWhopSDK, Submission } from '../lib/whop-sdk'

interface PayoutData {
  totalEarnings: number
  pendingPayouts: number
  completedPayouts: number
  averageCPM: number
  totalViews: number
  topEarners: Array<{
    user: string
    earnings: number
    views: number
    submissions: number
  }>
}

export function CPMPayoutView() {
  const sdk = useWhopSDK()
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')

  useEffect(() => {
    const loadData = async () => {
      if (!sdk) return
      
      setLoading(true)
      try {
        const submissionsData = await sdk.getSubmissions()
        setSubmissions(submissionsData)
        
        // Calculate payout data
        const approvedSubmissions = submissionsData.filter(s => s.status === 'approved')
        const totalViews = approvedSubmissions.reduce((sum, s) => sum + s.views, 0)
        const totalEarnings = approvedSubmissions.reduce((sum, s) => sum + (s.views * 4.00 / 1000), 0) // Assuming $4 CPM
        const pendingPayouts = approvedSubmissions.filter(s => !s.paid).length
        const completedPayouts = approvedSubmissions.filter(s => s.paid).length
        
        // Calculate top earners
        const userEarnings = approvedSubmissions.reduce((acc, submission) => {
          const earnings = submission.views * 4.00 / 1000
          const userKey = submission.username || submission.display_name || submission.creator_id
          if (!acc[userKey]) {
            acc[userKey] = { earnings: 0, views: 0, submissions: 0 }
          }
          acc[userKey].earnings += earnings
          acc[userKey].views += submission.views
          acc[userKey].submissions += 1
          return acc
        }, {} as Record<string, { earnings: number; views: number; submissions: number }>)
        
        const topEarners = Object.entries(userEarnings)
          .map(([user, data]) => ({ user, ...data }))
          .sort((a, b) => b.earnings - a.earnings)
          .slice(0, 10)
        
        setPayoutData({
          totalEarnings,
          pendingPayouts,
          completedPayouts,
          averageCPM: 4.00,
          totalViews,
          topEarners
        })
      } catch (error) {
        console.error('Error loading payout data:', error)
        setPayoutData(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [sdk])

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return submission.status === 'approved'
    if (filter === 'pending') return submission.status === 'approved' && !submission.paid
    if (filter === 'paid') return submission.status === 'approved' && submission.paid
    return true
  })

  const handleProcessPayout = async (submission: Submission) => {
    if (!sdk) return
    
    try {
      // In a real implementation, this would process the actual payout
      console.log(`Processing payout for submission ${submission.id}`)
      
      // Update submission status
      setSubmissions(prev => prev.map(s => 
        s.id === submission.id ? { ...s, paid: true } : s
      ))
    } catch (error) {
      console.error('Error processing payout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading payout data...</div>
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
              <h1 className="text-xl font-semibold">CPM Payouts</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'all', label: 'All Approved', count: submissions.filter(s => s.status === 'approved').length },
              { key: 'pending', label: 'Pending Payout', count: submissions.filter(s => s.status === 'approved' && !s.paid).length },
              { key: 'paid', label: 'Paid Out', count: submissions.filter(s => s.status === 'approved' && s.paid).length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filter === tab.key
                    ? 'text-white border-whop-dragon-fire'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {payoutData && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Earnings</p>
                    <p className="text-2xl font-bold text-white">${payoutData.totalEarnings.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-whop-dragon-fire" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Pending Payouts</p>
                    <p className="text-2xl font-bold text-white">{payoutData.pendingPayouts}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Completed Payouts</p>
                    <p className="text-2xl font-bold text-white">{payoutData.completedPayouts}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold text-white">{payoutData.totalViews.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Submissions List */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold">Approved Submissions</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-700">
                    {filteredSubmissions.map(submission => {
                      const earnings = submission.views * payoutData.averageCPM / 1000
                      return (
                        <div key={submission.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{submission.title}</h4>
                              <p className="text-gray-400 text-sm">{submission.username || submission.display_name}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                <span>{submission.views.toLocaleString()} views</span>
                                <span>${earnings.toFixed(2)} earnings</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  submission.paid 
                                    ? 'bg-green-900/20 text-green-400' 
                                    : 'bg-yellow-900/20 text-yellow-400'
                                }`}>
                                  {submission.paid ? 'Paid' : 'Pending'}
                                </span>
                              </div>
                            </div>
                            
                            {!submission.paid && (
                              <button
                                onClick={() => handleProcessPayout(submission)}
                                className="px-4 py-2 bg-whop-dragon-fire hover:bg-orange-600 text-white rounded-lg transition-colors"
                              >
                                Process Payout
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Top Earners */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold">Top Earners</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      {payoutData.topEarners.map((earner, index) => (
                        <div key={earner.user} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-white font-medium">{earner.user}</p>
                              <p className="text-gray-400 text-sm">{earner.submissions} submissions</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">${earner.earnings.toFixed(2)}</p>
                            <p className="text-gray-400 text-sm">{earner.views.toLocaleString()} views</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}