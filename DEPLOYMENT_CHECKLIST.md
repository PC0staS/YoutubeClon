# 🚀 Deployment Checklist

## Pre-Deployment
- [ ] Environment variables configured in hosting service
- [ ] YouTube API key tested and working
- [ ] Clerk authentication keys valid
- [ ] CRON_SECRET secure and added to CI/CD secrets

## Environment Variables to Set
```
PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
GOOGLE_API_KEY=your_api_key
CRON_SECRET=your_generated_secret
```

## GitHub Secrets to Set (if using GitHub Actions)
- `CRON_SECRET`: Same as environment variable
- `SITE_URL`: Your deployed site URL (e.g., https://yoursite.com)

## Hosting-Specific Steps

### Vercel
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically triggers

### Netlify
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables

### Railway
1. Connect GitHub
2. Add environment variables
3. Auto-deploy on push

## Post-Deployment
- [ ] Test video loading
- [ ] Test API endpoints
- [ ] Verify automated updates working
- [ ] Monitor for errors
- [ ] Set up monitoring/alerts

## Automation Testing
Test the update endpoint:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yoursite.com/api/update-videos
```

## Monitoring URLs
- Main site: https://yoursite.com
- API status: https://yoursite.com/api/videos
- Update endpoint: https://yoursite.com/api/update-videos (authenticated)
