# YouTube Clone - Automated Deployment Guide

## 🚀 Complete Automated YouTube Clone System

This is a fully automated YouTube clone that fetches videos, descriptions, and comments from YouTube API and updates them automatically without manual intervention.

## ✨ Features

- **Automated Video Fetching**: Automatically pulls latest videos from YouTube channel
- **Dynamic Comments**: Real YouTube comments with profile pictures
- **Automatic Updates**: Self-updating content via API and cron jobs
- **Caching System**: 10-minute cache for optimal performance
- **Fallback System**: Static data fallback if API fails
- **Authentication**: Clerk authentication system
- **Responsive Design**: Modern YouTube-like interface

## 📁 Project Structure

```
src/
├── components/
│   ├── contents.astro              # Static video list
│   ├── contents-dynamic.astro      # Dynamic video list (API-based)
│   ├── dashboard.astro             # Static dashboard
│   └── dashboard-dynamic.astro     # Dynamic dashboard (API-based)
├── pages/
│   ├── index.astro                 # Static version
│   ├── index-dynamic.astro         # Dynamic version (for deployment)
│   ├── video/[id].astro           # Static video detail page
│   ├── video-dynamic/[id].astro   # Dynamic video detail page
│   └── api/
│       ├── videos.js              # Main API endpoint with caching
│       └── update-videos.js       # Automated update endpoint
├── data/
│   └── videos.js                  # Static fallback data
└── utils/
    └── fetchUploads.js            # YouTube API utility
```

## 🛠 Setup Instructions

### 1. Environment Variables

Create/update your `.env` file:

```env
# Clerk Authentication
PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# YouTube API
GOOGLE_API_KEY=your_google_api_key

# Cron Job Security
CRON_SECRET=your_secure_random_string
```

### 2. Installation

```bash
npm install
```

### 3. Development

```bash
# Static version (for testing)
npm run dev

# Access at http://localhost:4321
```

### 4. Production Build

```bash
npm run build
npm run preview
```

## 🚀 Deployment Options

### Option 1: Deploy Dynamic Version (Recommended)

1. Replace `src/pages/index.astro` with `src/pages/index-dynamic.astro`
2. Deploy with any Node.js hosting service (Vercel, Netlify, Railway, etc.)

### Option 2: Keep Both Versions

- Static version: `http://yourdomain.com/`
- Dynamic version: `http://yourdomain.com/index-dynamic`

## 🤖 Automation Setup

### 1. API Endpoints

- **Main API**: `/api/videos` - Serves cached video data
- **Update API**: `/api/update-videos` - Authenticated endpoint for updates

### 2. Automated Updates

#### Option A: External Cron Service (Recommended)

Use services like:
- **Uptime Robot** (Free tier available)
- **Pingdom**
- **UptimeKuma** (Self-hosted)

Configure to call:
```
POST https://yourdomain.com/api/update-videos
Headers: Authorization: Bearer YOUR_CRON_SECRET
```

#### Option B: Server Cron Job

Add to your server's crontab:
```bash
# Update every 6 hours
0 */6 * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/update-videos
```

#### Option C: GitHub Actions (Free)

Create `.github/workflows/update-videos.yml`:
```yaml
name: Update Videos
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Update Videos
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            ${{ secrets.SITE_URL }}/api/update-videos
```

### 3. Webhook Setup (Optional)

For instant updates when new videos are uploaded:

1. Set up YouTube webhook via Google Cloud Console
2. Create webhook endpoint in your app
3. Trigger `/api/update-videos` when webhook receives data

## 🔧 Configuration

### YouTube Channel Setup

Update the playlist ID in:
- `src/pages/api/videos.js`
- `src/pages/api/update-videos.js`
- `src/utils/fetchUploads.js`

```javascript
const UPLOADS_PLAYLIST_ID = 'YOUR_CHANNEL_UPLOADS_PLAYLIST_ID';
```

### Cache Duration

Modify cache duration in `src/pages/api/videos.js`:
```javascript
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
```

## 📊 Monitoring

### API Status Indicators

The dynamic components show:
- **Cache Status**: Whether data is from cache or fresh
- **Last Update**: When data was last refreshed
- **Fallback Mode**: If using static data due to API failure

### Error Handling

- API failures automatically fallback to static data
- Comments failing don't break video loading
- Profile images have fallback to generated avatars

## 🎯 Usage Modes

### 1. Fully Static (Development/Backup)
- Uses `contents.astro` and `video/[id].astro`
- Data from `src/data/videos.js`
- No API calls, fastest loading

### 2. Fully Dynamic (Production)
- Uses `contents-dynamic.astro` and `video-dynamic/[id].astro`
- Real-time data from YouTube API
- Automatic updates

### 3. Hybrid (Testing)
- Mix of static and dynamic components
- Good for gradual migration

## 🔒 Security

- API endpoints are rate-limited by cache
- Update endpoint requires authentication
- Environment variables protect sensitive keys
- CORS properly configured

## 📈 Performance

- **Memory Caching**: 10-minute cache reduces API calls
- **Lazy Loading**: Images load as needed
- **Fallback System**: Always functional even if APIs fail
- **CDN-Ready**: Static assets can be served from CDN

## 🐛 Troubleshooting

### Common Issues

1. **API Rate Limits**: Increase cache duration
2. **Authentication Errors**: Check Clerk keys
3. **YouTube API Errors**: Verify API key and quotas
4. **Cron Not Working**: Check authentication header

### Debug Mode

Add to your `.env`:
```env
NODE_ENV=development
```

## 📝 Maintenance

### Regular Tasks

1. **Monitor API Quotas**: YouTube API has daily limits
2. **Check Error Logs**: Monitor for failed updates
3. **Update Dependencies**: Keep packages current
4. **Backup Static Data**: Regular exports of video data

### Scaling

- **Multiple Channels**: Add more playlist IDs
- **Load Balancing**: Use multiple API keys
- **Database**: Replace memory cache with Redis/database
- **CDN**: Serve static assets from CDN

## 🎉 Deployment Checklist

- [ ] Environment variables configured
- [ ] YouTube API key working
- [ ] Clerk authentication setup
- [ ] CRON_SECRET generated and secure
- [ ] Automated update system configured
- [ ] Monitoring/alerting setup
- [ ] Error handling tested
- [ ] Cache duration optimized
- [ ] Static fallback data current

## 🌐 Recommended Hosting

### Free Tiers Available:
- **Vercel**: Easy deployment, edge functions
- **Netlify**: Great for static sites with functions
- **Railway**: Simple Node.js deployment

### Paid Options:
- **AWS/Azure/GCP**: Full control, scalable
- **DigitalOcean**: Cost-effective VPS
- **Heroku**: Simple platform-as-a-service

Your YouTube clone is now fully automated and ready for deployment! 🚀
