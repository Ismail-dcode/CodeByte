# Deployment Test Guide

## After deploying to Vercel, test these endpoints:

### 1. Health Check
Visit: `https://your-project.vercel.app/api/health`
Expected: JSON response with status "OK"

### 2. Main Application
Visit: `https://your-project.vercel.app/`
Expected: Code-Byte application loads

### 3. Static Assets
Visit: `https://your-project.vercel.app/css/styles.css`
Expected: CSS file loads

### 4. API Test
Test the image analysis API:
```bash
curl -X POST https://your-project.vercel.app/api/analyze \
  -F "image=@test-image.jpg" \
  -F "prompt=Describe this image"
```

## Common 404 Fixes:

1. **Check Environment Variables**: Make sure `API_KEY` is set in Vercel dashboard
2. **Redeploy**: After setting environment variables, redeploy the project
3. **Check Routes**: Verify `vercel.json` is properly configured
4. **File Structure**: Ensure all files are in the correct directories

## If still getting 404:

1. Go to Vercel dashboard → Project Settings → Functions
2. Check if the API functions are listed
3. Check deployment logs for any build errors
4. Verify the project structure matches the expected layout
