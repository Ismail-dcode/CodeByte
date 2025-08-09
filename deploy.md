# Quick Deployment Guide for Vercel

## ✅ Pre-deployment Checklist

- [ ] Project is pushed to Git repository (GitHub/GitLab/Bitbucket)
- [ ] Google AI API key is ready
- [ ] Vercel account is created

## 🚀 Deployment Steps

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your account
3. Click "New Project"

### 2. Import Repository
1. Connect your Git provider (GitHub, etc.)
2. Select your repository: `DevStrom-4th-FinalCopy`
3. Vercel will auto-detect the project settings

### 3. Configure Project
- **Framework Preset**: Other
- **Root Directory**: `./` (leave as default)
- **Build Command**: Leave empty (not needed)
- **Output Directory**: Leave empty (not needed)

### 4. Set Environment Variables
Before deploying, add this environment variable:
- **Name**: `API_KEY`
- **Value**: Your Google AI API key
- **Environment**: Production

### 5. Deploy
Click "Deploy" and wait for the build to complete.

### 6. Test Your App
1. Visit your deployed URL
2. Test image upload and analysis
3. Check health endpoint: `your-url.vercel.app/api/health`

## 🔧 Troubleshooting

### If you get "API key not configured":
1. Go to Project Settings → Environment Variables
2. Add `API_KEY` with your Google AI key
3. Redeploy the project

### If you get function timeout:
- The default is 10 seconds
- Large images may take longer
- Consider resizing images before upload

### If static files don't load:
- Check that `vercel.json` is properly configured
- Ensure files are in the correct directories

## 📞 Support
- Check Vercel deployment logs
- Verify environment variables
- Test the health endpoint first
