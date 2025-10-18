import React, { useState } from 'react'
import { Star, Users, Shield, Award, TrendingUp, CheckCircle } from 'lucide-react'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

interface Stat {
  label: string
  value: string
  icon: React.ReactNode
}

export function DiscoverView() {
  const [stats] = useState<Stat[]>([
    {
      label: 'Active Users',
      value: '2,847',
      icon: <Users className="w-6 h-6" />
    },
    {
      label: 'Rewards Earned',
      value: '15,420',
      icon: <Award className="w-6 h-6" />
    },
    {
      label: 'Content Reports',
      value: '1,203',
      icon: <Shield className="w-6 h-6" />
    },
    {
      label: 'Community Score',
      value: '98.5%',
      icon: <TrendingUp className="w-6 h-6" />
    }
  ])

  const features: Feature[] = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Brand Safety First',
      description: 'Advanced AI-powered content moderation ensures all content aligns with your brand values and community guidelines.'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Reward System',
      description: 'Earn points for sharing brand-safe content, engaging positively, and helping maintain community standards.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Building',
      description: 'Foster a positive community environment where users are incentivized to contribute valuable, brand-safe content.'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Gamification',
      description: 'Turn content moderation into an engaging experience with leaderboards, achievements, and exclusive rewards.'
    }
  ]

  const benefits = [
    'Reduced brand risk through proactive content monitoring',
    'Increased user engagement with positive reinforcement',
    'Automated content filtering with human oversight',
    'Real-time community health metrics',
    'Customizable reward structures for different content types',
    'Integration with existing community platforms'
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-whop-primary to-whop-secondary rounded-lg shadow-lg">
        <div className="px-6 py-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Brand Safe Content Rewards
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Transform your community into a brand-safe environment where users are rewarded for positive contributions and responsible content sharing.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-whop-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-whop-primary transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Community Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-whop-primary/10 rounded-lg text-whop-primary">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-whop-primary/10 rounded-lg text-whop-primary">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 rounded-lg">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Choose Brand Safe Content Rewards?
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-whop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Install & Configure
              </h3>
              <p className="text-gray-600">
                Set up the app in your Whop community and configure your brand safety guidelines and reward structure.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-whop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Monitor & Reward
              </h3>
              <p className="text-gray-600">
                The system automatically monitors content and rewards users for brand-safe contributions and positive engagement.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-whop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Grow & Engage
              </h3>
              <p className="text-gray-600">
                Watch your community grow with engaged users who are motivated to contribute valuable, brand-safe content.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-whop-secondary to-whop-accent rounded-lg shadow-lg">
        <div className="px-6 py-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Community?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using Brand Safe Content Rewards to build thriving, brand-safe communities.
          </p>
          <button className="bg-white text-whop-secondary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
            Install App Now
          </button>
        </div>
      </div>
    </div>
  )
}
