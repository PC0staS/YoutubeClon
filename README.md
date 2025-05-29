# 🎥 YouTube Clone - Fully Automated

A complete YouTube clone that automatically fetches and updates content from YouTube without manual intervention.

## ✨ Features

- **🤖 Fully Automated**: Videos, descriptions, and comments update automatically
- **📺 YouTube-like Interface**: Modern, responsive design matching YouTube's style
- **💬 Real Comments**: Displays actual YouTube comments with profile pictures
- **🔄 Smart Caching**: 10-minute cache with fallback to static data
- **🔐 Authentication**: Secure user authentication with Clerk
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile
- **🚀 Production Ready**: Optimized for deployment with monitoring

## 🏗️ Architecture

### Dynamic System (Production)
- **API-Driven**: All content served via REST APIs
- **Auto-Updates**: Scheduled updates via cron jobs or webhooks
- **Caching Layer**: Memory cache with configurable TTL
- **Fallback System**: Static data backup if APIs fail

### Static System (Development)
- **Static Data**: Pre-generated content for fast development
- **Instant Loading**: No API calls, immediate page loads

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Clone and install
git clone <repository>
cd YoutubeClon
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### 2. Run Deployment Setup
```bash
./deploy-setup.sh
```

### 3. Development
```bash
npm run dev
```

### 4. Production Deployment
```bash
npm run build
npm run preview
```

## 📋 Environment Variables

```env
# Required for authentication
PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Required for YouTube API
GOOGLE_API_KEY=your_google_api_key

# Required for automation
CRON_SECRET=your_secure_random_string

# Optional
NODE_ENV=production
WEBHOOK_SECRET=your_webhook_secret
```

## 🛠️ API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/videos` | GET | Get cached video data | No |
| `/api/update-videos` | GET | Force update videos | Yes (Bearer token) |
| `/api/health` | GET | System health check | No |
| `/api/webhook` | POST | Webhook for real-time updates | Yes (Signature) |

## 🔄 Automation Setup

### Option 1: External Cron Service (Recommended)
Use services like **Uptime Robot**, **Pingdom**, or **Better Uptime**:

```bash
# Configure HTTP monitor
URL: https://yoursite.com/api/update-videos
Method: GET
Headers: Authorization: Bearer YOUR_CRON_SECRET
Interval: Every 6 hours
```

### Option 2: GitHub Actions (Free)
Automatically configured in `.github/workflows/update-videos.yml`

Set these secrets in your repository:
- `CRON_SECRET`: Your cron secret key
- `SITE_URL`: Your deployed site URL

### Option 3: Server Cron Job
```bash
# Add to crontab
0 */6 * * * curl -H "Authorization: Bearer YOUR_SECRET" https://yoursite.com/api/update-videos
```

## 📊 Monitoring

### Admin Dashboard
Visit `/admin` for real-time system monitoring:
- API status and health
- Cache status and last update
- Manual update triggers
- Environment validation
- System information

### Health Check
Visit `/api/health` for JSON system status:
```json
{
  "status": "healthy",
  "timestamp": "2025-05-29T...",
  "environment": {
    "hasApiKey": true,
    "hasCronSecret": true
  },
  "fallbackData": {
    "available": true,
    "videoCount": 10
  }
}
```

## 🚀 Deployment

### Supported Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically

#### Netlify
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

#### Railway
1. Connect GitHub repository
2. Environment variables auto-detected
3. Deploy with one click

#### Docker
```bash
# Build and run
docker build -t youtube-clone .
docker run -p 4321:4321 --env-file .env youtube-clone

# Or use docker-compose
docker-compose up
```

## 📁 Project Structure

```
src/
├── components/
│   ├── contents.astro              # Static video grid
│   ├── contents-dynamic.astro      # Dynamic video grid (API)
│   ├── dashboard.astro             # Static dashboard
│   ├── dashboard-dynamic.astro     # Dynamic dashboard (API)
│   ├── navbar.astro               # Navigation with search
│   └── footer.astro               # Footer component
├── pages/
│   ├── index.astro                # Static home page
│   ├── index-dynamic.astro        # Dynamic home page (for deployment)
│   ├── admin.astro               # Admin monitoring dashboard
│   ├── video/[id].astro          # Static video detail page
│   ├── video-dynamic/[id].astro  # Dynamic video detail page
│   └── api/
│       ├── videos.js             # Main API with caching
│       ├── update-videos.js      # Authenticated update endpoint
│       ├── health.js             # Health check endpoint
│       └── webhook.js            # Webhook for real-time updates
├── data/
│   └── videos.js                 # Static fallback data
└── utils/
    ├── fetchUploads.js           # YouTube API utility
    └── cronJob.js               # Cron job setup
```

## 🔧 Configuration

### YouTube Channel Setup
Update the playlist ID in API files:
```javascript
const UPLOADS_PLAYLIST_ID = 'YOUR_CHANNEL_UPLOADS_PLAYLIST_ID';
```

### Cache Duration
Modify in `src/pages/api/videos.js`:
```javascript
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
```

### Update Frequency
Configure automation intervals:
- **Frequent**: Every 2 hours (`0 */2 * * *`)
- **Normal**: Every 6 hours (`0 */6 * * *`)
- **Conservative**: Every 12 hours (`0 0 */12 * *`)

## 🛡️ Security Features

- **API Rate Limiting**: Built-in caching prevents API abuse
- **Authentication**: Secure admin endpoints with bearer tokens
- **CORS Protection**: Proper cross-origin request handling
- **Environment Security**: Sensitive data in environment variables
- **Webhook Verification**: Signature verification for webhooks

## 🔍 Troubleshooting

### Common Issues

1. **API Rate Limits**
   - Solution: Increase cache duration
   - Monitor: Check YouTube API quotas

2. **Authentication Errors**
   - Solution: Verify Clerk keys in environment
   - Test: Visit `/api/health` to check environment

3. **Videos Not Updating**
   - Solution: Check automation setup
   - Test: Manual update via `/admin` dashboard

4. **Slow Loading**
   - Solution: Verify cache is working
   - Monitor: Check cache status in admin dashboard

### Debug Mode
Set `NODE_ENV=development` for detailed logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Roadmap

- [ ] Multiple channel support
- [ ] Advanced comment system
- [ ] Live streaming support
- [ ] Mobile app

---

## 📞 Support

Need help? Check the [Deployment Guide](DEPLOYMENT_GUIDE.md) or open an issue.

**Happy coding! 🚀**