# 🚀 Deployment Guide - Brand Safe Content Approval App

This guide will walk you through deploying your Whop app from development to production and publishing it to the Whop App Store.

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ Whop developer account
- ✅ GitHub account
- ✅ Vercel account (free)

## 🎯 Step-by-Step Deployment

### Step 1: Create GitHub Repository

1. **Go to GitHub.com** and create a new repository
   - Repository name: `brand-safe-content-approval` (or your preferred name)
   - Make it public or private (your choice)
   - Don't initialize with README (we already have one)

2. **Connect your local repository:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/brand-safe-content-approval.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Set Up Whop App

1. **Go to Whop Dashboard**
   - Navigate to [whop.com/dashboard](https://whop.com/dashboard)
   - Go to **Developer** → **Apps**
   - Click **"Create app"**

2. **Configure your app:**
   - **App Name**: "Brand Safe Content Approval"
   - **Description**: "A comprehensive app for brand-safe content approval and CPM-based rewards"
   - **Category**: Select "Community" or "Marketing"

3. **Get your environment variables:**
   - In your app settings, copy the **"Environment variables"**
   - Create a `.env.local` file in your project root
   - Paste the environment variables

4. **Set up app URLs:**
   - **Base URL**: `http://localhost:3000` (for development)
   - **Experience URL**: `/` (main user interface)
   - **Discover URL**: `/discover` (public marketing page)
   - **Dashboard URL**: `/dashboard` (admin interface)

### Step 3: Deploy to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with your GitHub account

2. **Import your project:**
   - Click **"Import Git Repository"**
   - Select your `brand-safe-content-approval` repository
   - Click **"Import"**

3. **Configure deployment:**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - Click **"Deploy"**

4. **Get your production URL:**
   - Wait for deployment to complete
   - Copy your Vercel domain (e.g., `your-app.vercel.app`)

### Step 4: Update Whop App for Production

1. **Update Base URL:**
   - Go back to your Whop app settings
   - Update **Base URL** to your Vercel domain
   - Example: `https://your-app.vercel.app`

2. **Add environment variables to Vercel:**
   - Go to your Vercel project dashboard
   - Go to **Settings** → **Environment Variables**
   - Add all your Whop environment variables
   - Make sure they're available in **Production**

### Step 5: Test Production App

1. **Switch to production mode:**
   - In your Whop app, click the **gear icon** (⚙️)
   - Switch from **"Local"** to **"Production"**
   - Your app should now load from Vercel

2. **Test all features:**
   - Content submission
   - Moderation dashboard
   - Payout tracking
   - Analytics
   - Notifications

### Step 6: Publish to Whop App Store

1. **Prepare your app listing:**
   - Go to Whop Dashboard → **Developer** → **Discover**
   - Click **"Publish to the App Store"**

2. **Complete app information:**
   - **App Icon**: Upload a 512x512 PNG icon
   - **App Name**: "Brand Safe Content Approval"
   - **Short Description**: "Brand-safe content approval system with CPM rewards"
   - **Full Description**: 
     ```
     A comprehensive solution for big brands and content creators to ensure brand safety while earning CPM-based rewards. Creators submit content for approval before posting, protecting brand reputation while incentivizing quality content creation.

     Features:
     • Content submission with drag-and-drop upload
     • Brand moderation dashboard
     • CPM-based payout system
     • Real-time notifications
     • Comprehensive analytics
     • Brand safety scoring
     ```

3. **Add screenshots:**
   - Take screenshots of your app's main features
   - Upload 3-5 high-quality images
   - Show the content submission, moderation, and analytics views

4. **Set pricing (if applicable):**
   - Choose if your app is free or paid
   - Set up pricing tiers if needed

5. **Submit for review:**
   - Review all information
   - Click **"Submit for Review"**
   - Wait for Whop team approval (typically 2-5 business days)

## 🔧 Environment Variables Reference

Create a `.env.local` file with these variables:

```env
# Whop App Configuration
WHOP_APP_ID=your_app_id_here
WHOP_APP_SECRET=your_app_secret_here
WHOP_APP_ENV=development
WHOP_APP_BASE_URL=http://localhost:3000

# For Production (update in Vercel)
WHOP_APP_ENV=production
WHOP_APP_BASE_URL=https://your-app.vercel.app

# Optional: OpenAI API Key for AI-powered content moderation
OPENAI_API_KEY=your_openai_api_key_here
```

## 📱 App Features Overview

### For Content Creators:
- **Submit Content**: Upload videos, images, or text posts
- **Track Earnings**: View CPM-based payouts and performance
- **Get Notifications**: Real-time updates on content approval
- **View Analytics**: Track content performance and engagement

### For Brand Managers:
- **Review Content**: Approve or reject submissions before posting
- **Monitor Performance**: Track brand safety scores and engagement
- **Manage Payouts**: Configure CPM rates and payment settings
- **Analytics Dashboard**: Comprehensive insights and reporting

## 🛠️ Troubleshooting

### Common Issues:

1. **App not loading in Whop:**
   - Check that Base URL is correct
   - Verify environment variables are set
   - Make sure app is in correct environment mode

2. **Environment variables not working:**
   - Ensure variables are set in Vercel
   - Check that they're available in Production environment
   - Restart the Vercel deployment

3. **Build errors:**
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript errors

4. **Whop SDK issues:**
   - Verify app ID and secret are correct
   - Check that app is properly configured in Whop dashboard
   - Ensure all required permissions are enabled

## 📞 Support

- **Whop Developer Docs**: [docs.whop.com/apps](https://docs.whop.com/apps)
- **Whop Developer Community**: [whop.com/developers](https://whop.com/developers)
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)

## 🎉 Success!

Once your app is approved and published:
- Share it with your network
- Market it to potential users
- Monitor usage and feedback
- Iterate and improve based on user needs

Your Brand Safe Content Approval app is now ready to help big brands maintain their reputation while rewarding content creators for brand-safe content! 🚀
