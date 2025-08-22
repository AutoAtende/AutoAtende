#!/bin/bash

# Deploy script for Frontend SSR
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment of Frontend SSR..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# 2. Build the application
echo "🔨 Building application..."
npm run build

# 3. Create ecosystem file for PM2
echo "⚙️  Creating PM2 ecosystem file..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'fonte-frontend-ssr',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/your/frontend-ssr', // Ajuste o caminho
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
}
EOF

# 4. Create logs directory
mkdir -p logs

# 5. Start/Restart with PM2
echo "🔄 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save

# 6. Setup Nginx (if not already done)
if [ ! -f /etc/nginx/sites-available/sac.autoatende.com ]; then
    echo "📋 Setting up Nginx configuration..."
    sudo cp nginx-frontend.conf /etc/nginx/sites-available/sac.autoatende.com
    sudo ln -sf /etc/nginx/sites-available/sac.autoatende.com /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend SSR running at: https://sac.autoatende.com"
echo "📊 Monitor with: pm2 monit"
echo "📝 Logs: pm2 logs fonte-frontend-ssr"