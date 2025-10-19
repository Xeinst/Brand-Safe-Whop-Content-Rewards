import { useState } from 'react'
import { Users, Building2, ArrowRight, Star, Shield, DollarSign } from 'lucide-react'

export type UserRole = 'creator' | 'brand'

interface RoleSelectorProps {
  onRoleSelect: (role: UserRole) => void
}

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  const roles = [
    {
      id: 'creator' as UserRole,
      title: 'Content Creator',
      description: 'Submit content for approval and earn CPM rewards when published',
      icon: Users,
      features: [
        'Submit content for brand approval',
        'Earn CPM rewards when published',
        'Track submission status',
        'Whop payment integration',
        'Brand-safe content workflow'
      ],
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'brand' as UserRole,
      title: 'Brand Manager',
      description: 'Create content rewards, review submissions, and approve content before publishing',
      icon: Building2,
      features: [
        'Create content reward campaigns',
        'Review and approve submissions',
        'Brand safety controls',
        'Payment processing via Whop',
        'Analytics and performance tracking'
      ],
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-whop-primary to-whop-secondary rounded-full mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Content Rewards Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to access the platform. Creators earn CPM rewards for approved content, 
            while brands ensure content safety and manage campaigns.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.id
            
            return (
              <div
                key={role.id}
                className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected ? 'ring-4 ring-whop-primary ring-opacity-50' : ''
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className={`${role.bgColor} ${role.borderColor} border-2 rounded-2xl p-8 h-full`}>
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${role.color} rounded-full mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {role.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-whop-primary rounded-full mr-3 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-whop-primary rounded-full flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          {selectedRole && (
            <button
              onClick={() => onRoleSelect(selectedRole)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-whop-primary to-whop-secondary text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Continue as {selectedRole === 'creator' ? 'Content Creator' : 'Brand Manager'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Secure Payments
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Whop Integration
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Brand Safe
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
