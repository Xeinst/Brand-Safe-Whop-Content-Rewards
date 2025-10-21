# 🔐 Whop App Permissions Setup Guide

This guide covers all the permissions your Brand Safe Content Rewards app needs to function properly in the Whop ecosystem.

## 🎯 Required Permissions

### 1. **User Information Permissions**

#### `read_user` (Required)
- **Purpose**: Read user's basic details for role detection
- **Why needed**: Automatically detect if user is a Whop member
- **Usage**: Determine if user should see Content Creator or Brand Manager interface

```typescript
// This permission allows us to:
const user = await sdk.getUser()
// Returns: { id, username, email, avatar, display_name }
```

#### `read_user_profile` (Required)
- **Purpose**: Access user profile information
- **Why needed**: Display user info in dashboard and track content submissions
- **Usage**: Show user avatar, name, and profile details

### 2. **Content Management Permissions**

#### `read_content` (Required)
- **Purpose**: Read content submissions and reviews
- **Why needed**: Display submitted content for brand managers to review
- **Usage**: Show content queue, review status, and approval history

#### `write_content` (Required)
- **Purpose**: Create and update content submissions
- **Why needed**: Allow creators to submit content for approval
- **Usage**: Upload videos, images, and text content for brand review

### 3. **Community/Company Permissions**

#### `read_company` (Required)
- **Purpose**: Access company/community information
- **Why needed**: Display brand information and community details
- **Usage**: Show company name, logo, and community context

```typescript
// This permission allows us to:
const company = await sdk.getCompany()
// Returns: { id, name, description, logo }
```

#### `read_company_members` (Required)
- **Purpose**: Access community member information
- **Why needed**: Verify membership status and role detection
- **Usage**: Determine if user is a community member vs external brand manager

### 4. **Payment/Financial Permissions**

#### `read_payments` (Required)
- **Purpose**: Access payment and transaction information
- **Why needed**: Track CPM payouts and earnings
- **Usage**: Display earnings dashboard and payment history

#### `write_payments` (Required)
- **Purpose**: Process payments and payouts
- **Why needed**: Handle CPM-based rewards and creator payments
- **Usage**: Process approved content payouts

### 5. **Analytics Permissions**

#### `read_analytics` (Required)
- **Purpose**: Access performance and engagement data
- **Why needed**: Show analytics dashboard and content performance
- **Usage**: Display view counts, engagement metrics, and ROI data

#### `member:stats:export` (Required)
- **Purpose**: Export member statistics and analytics data
- **Why needed**: Allow brand managers to export comprehensive member statistics for reporting and analysis
- **Usage**: Export member engagement, content performance, and reward statistics to CSV/Excel

## 🚀 How to Add Permissions

### Step 1: Access Whop Developer Dashboard

1. **Go to Whop Dashboard**
   - Navigate to [whop.com/dashboard](https://whop.com/dashboard)
   - Click **"Developer"** → **"Apps"**
   - Select your "Brand Safe Content Rewards" app

2. **Navigate to Permissions**
   - Click on **"Permissions"** in the left sidebar
   - You'll see a list of available permissions

### Step 2: Add Required Permissions

Click **"Add Permissions"** and add each of these:

#### Core Permissions (Required)
```
✅ read_user - Read user basic information
✅ read_user_profile - Access user profile details  
✅ read_company - Access company/community info
✅ read_company_members - Access community members
```

#### Content Permissions (Required)
```
✅ read_content - Read content submissions
✅ write_content - Create/update content
✅ read_analytics - Access performance data
✅ member:stats:export - Export member statistics
```

#### Payment Permissions (Required)
```
✅ read_payments - Read payment information
✅ write_payments - Process payments and payouts
```

### Step 3: Configure Permission Details

For each permission, provide:

#### Permission Justification
```
read_user: "Required to automatically detect user role and membership status"
read_user_profile: "Needed to display user information in dashboard"
read_company: "Required to show brand/community context and information"
read_company_members: "Needed to verify membership status for role detection"
read_content: "Required to display content submissions for brand review"
write_content: "Needed for creators to submit content for approval"
read_analytics: "Required to show performance metrics and engagement data"
member:stats:export: "Needed to export comprehensive member statistics for reporting and analysis"
read_payments: "Needed to display earnings and payment history"
write_payments: "Required to process CPM-based creator payouts"
```

#### Permission Requirements
- Mark all permissions as **"Required"** (not optional)
- This ensures the app functions properly for all users

### Step 4: Save and Test

1. **Save Permissions**
   - Click **"Save"** after adding all permissions
   - Review the permission list to ensure all are added

2. **Test Permissions**
   - Install the app in a test Whop
   - Verify that role detection works automatically
   - Test content submission and review features
   - Check that analytics and payments work

## 🔧 Permission Implementation

### In Your App Code

The permissions are automatically handled by the Whop SDK:

```typescript
// User information (requires read_user, read_user_profile)
const user = await sdk.getUser()
const isMember = sdk.isWhopMember()

// Company information (requires read_company)
const company = await sdk.getCompany()

// Content management (requires read_content, write_content)
const submissions = await sdk.getContentSubmissions()
await sdk.submitContent(contentData)

// Analytics (requires read_analytics)
const analytics = await sdk.getAnalytics()

// Member Statistics Export (requires member:stats:export)
const memberStats = await sdk.getMemberStatistics()
await sdk.exportMemberStats(format, dateRange)

// Payments (requires read_payments, write_payments)
const earnings = await sdk.getEarnings()
await sdk.processPayout(payoutData)
```

### Automatic Role Detection

With proper permissions, the app automatically detects user roles:

```typescript
// This works because we have read_company_members permission
const detectUserRole = async () => {
  const isWhopMember = sdk.isWhopMember()
  
  if (isWhopMember) {
    // User is a Whop community member → Content Creator
    setUserRole('creator')
  } else {
    // User is not a member → Brand Manager
    setUserRole('brand')
  }
}
```

## ⚠️ Important Notes

### Permission Requirements
- **All permissions are required** for the app to function properly
- Users must approve these permissions when installing the app
- Without proper permissions, role detection and content features won't work

### Security Considerations
- Permissions are scoped to only what the app needs
- Users can revoke permissions at any time
- App gracefully handles permission errors

### Testing Permissions
- Test with different user types (members vs non-members)
- Verify content submission and review workflows
- Check that analytics and payments work correctly

## 🎯 Permission Benefits

### For Content Creators
- **Automatic role detection** - No manual role selection needed
- **Seamless content submission** - Direct access to upload interface
- **Real-time earnings tracking** - View CPM payouts and analytics

### For Brand Managers
- **Automatic brand interface** - Direct access to moderation dashboard
- **Content review capabilities** - Approve/reject submissions
- **Analytics and reporting** - Track performance and ROI

### For App Functionality
- **Seamless user experience** - No manual role selection
- **Proper data access** - All features work as intended
- **Secure operations** - Permissions ensure proper access control

## 🚀 Next Steps

1. **Add all required permissions** in Whop Dashboard
2. **Test the app** with different user types
3. **Verify automatic role detection** works
4. **Test all content and payment features**
5. **Deploy to production** with full permissions

With these permissions properly configured, your Brand Safe Content Rewards app will have full access to all necessary Whop APIs and provide a seamless experience for both content creators and brand managers! 🎉
