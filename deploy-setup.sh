#!/bin/bash

# YouTube Clone Automated Deployment Script
echo "🚀 YouTube Clone - Automated Deployment Setup"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "astro.config.mjs" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Function to generate random string for CRON_SECRET
generate_random_string() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

echo "📋 Deployment Mode Selection:"
echo "1. Setup for Fully Dynamic Deployment (Recommended)"
echo "2. Keep Both Static and Dynamic Versions"
echo "3. Generate Environment Template Only"

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo "🔄 Setting up fully dynamic deployment..."
        
        # Backup original index.astro
        if [ -f "src/pages/index.astro" ]; then
            cp "src/pages/index.astro" "src/pages/index-static-backup.astro"
            echo "✅ Backed up original index.astro"
        fi
        
        # Replace index.astro with dynamic version
        cp "src/pages/index-dynamic.astro" "src/pages/index.astro"
        echo "✅ Replaced index.astro with dynamic version"
        ;;
    2)
        echo "✅ Keeping both versions available"
        echo "   Static: http://yourdomain.com/"
        echo "   Dynamic: http://yourdomain.com/index-dynamic"
        ;;
    3)
        echo "✅ Environment template mode only"
        ;;
esac

# Generate CRON_SECRET if not exists
if [ -f ".env" ]; then
    if ! grep -q "CRON_SECRET" .env; then
        CRON_SECRET=$(generate_random_string)
        echo "CRON_SECRET=$CRON_SECRET" >> .env
        echo "✅ Generated and added CRON_SECRET to .env"
    else
        echo "✅ CRON_SECRET already exists in .env"
    fi
else
    echo "❌ .env file not found. Creating template..."
    cat > .env << EOF
# Clerk Authentication
PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# YouTube API
GOOGLE_API_KEY=your_google_api_key_here

# Cron Job Security (Generated)
CRON_SECRET=$(generate_random_string)

# Optional: Node Environment
NODE_ENV=production
EOF
    echo "✅ Created .env template with generated CRON_SECRET"
fi

# Create GitHub Actions workflow for automated updates
mkdir -p .github/workflows
cat > .github/workflows/update-videos.yml << 'EOF'
name: Update YouTube Videos
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Allow manual trigger

jobs:
  update-videos:
    runs-on: ubuntu-latest
    steps:
      - name: Update Videos from YouTube
        run: |
          response=$(curl -s -w "%{http_code}" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ secrets.SITE_URL }}/api/update-videos")
          
          http_code=$(echo "$response" | tail -n1)
          body=$(echo "$response" | head -n -1)
          
          if [ "$http_code" = "200" ]; then
            echo "✅ Videos updated successfully"
            echo "$body"
          else
            echo "❌ Failed to update videos (HTTP $http_code)"
            echo "$body"
            exit 1
          fi
EOF

echo "✅ Created GitHub Actions workflow"

# Create docker-compose for local development
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  youtube-clone:
    build: .
    ports:
      - "4321:4321"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped

  # Optional: Redis for advanced caching
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
EOF

echo "✅ Created docker-compose.yml"

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4321

CMD ["npm", "run", "preview"]
EOF

echo "✅ Created Dockerfile"

# Create deployment checklist
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
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
EOF

echo "✅ Created deployment checklist"

# Update package.json with deployment scripts
if command -v jq >/dev/null 2>&1; then
    jq '.scripts.deploy = "npm run build && npm run preview"' package.json > package.json.tmp && mv package.json.tmp package.json
    jq '.scripts.start = "npm run preview"' package.json > package.json.tmp && mv package.json.tmp package.json
    echo "✅ Updated package.json with deployment scripts"
else
    echo "⚠️  jq not found. Manually add these scripts to package.json:"
    echo '  "deploy": "npm run build && npm run preview",'
    echo '  "start": "npm run preview"'
fi

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env with your actual API keys"
echo "2. Test locally with: npm run dev"
echo "3. Build for production: npm run build"
echo "4. Deploy to your hosting service"
echo "5. Set up automated updates (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "📁 Files Created:"
echo "   - DEPLOYMENT_GUIDE.md (comprehensive guide)"
echo "   - DEPLOYMENT_CHECKLIST.md (quick checklist)"
echo "   - .github/workflows/update-videos.yml (GitHub Actions)"
echo "   - docker-compose.yml (containerization)"
echo "   - Dockerfile (container image)"
echo ""
echo "🔗 Dynamic Version URLs:"
echo "   - Main: /index-dynamic"
echo "   - Videos: /video-dynamic/[id]"
echo "   - API: /api/videos"
echo ""

# Show current CRON_SECRET if it exists
if [ -f ".env" ] && grep -q "CRON_SECRET" .env; then
    CURRENT_SECRET=$(grep "CRON_SECRET" .env | cut -d'=' -f2)
    echo "🔐 Your CRON_SECRET: $CURRENT_SECRET"
    echo "   (Save this for setting up automated updates)"
fi

echo ""
echo "✨ Your YouTube clone is ready for automated deployment!"
