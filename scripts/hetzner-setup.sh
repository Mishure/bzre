#!/bin/bash
# Hetzner VPS Setup Script for Buzau Real Estate
# Run this on your fresh Ubuntu 22.04 Hetzner VPS

set -e

echo "🏠 Setting up Buzau Real Estate on Hetzner VPS..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18
echo "🟢 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
echo "🔄 Installing PM2 process manager..."
npm install -g pm2

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx

# Create application user
echo "👤 Creating app user..."
useradd -m -s /bin/bash buzau
usermod -aG sudo buzau

# Create directories
echo "📁 Creating directories..."
mkdir -p /var/www/buzau-realestate
mkdir -p /var/www/buzau-realestate/backups
chown -R buzau:buzau /var/www/buzau-realestate

# Setup firewall
echo "🔥 Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow http
ufw allow https

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/buzau-realestate << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
        
    # Static files caching
    location /_next/static {
        alias /var/www/buzau-realestate/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/buzau-realestate /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx

# Setup SSL with Let's Encrypt (optional)
echo "🔒 Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# Setup log rotation
echo "📋 Setting up log rotation..."
cat > /etc/logrotate.d/buzau-realestate << 'EOF'
/var/www/buzau-realestate/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 buzau buzau
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create database backup script
echo "💾 Setting up database backups..."
cat > /usr/local/bin/backup-buzau-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/www/buzau-realestate/backups"
DB_FILE="/var/www/buzau-realestate/prisma/dev.db"

if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_DIR/buzau_backup_$DATE.db"
    # Keep only last 30 days of backups
    find "$BACKUP_DIR" -name "buzau_backup_*.db" -mtime +30 -delete
    echo "Database backed up to buzau_backup_$DATE.db"
else
    echo "Database file not found!"
fi
EOF

chmod +x /usr/local/bin/backup-buzau-db.sh

# Setup daily backup cron
echo "⏰ Setting up daily backups..."
(crontab -u buzau -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-buzau-db.sh") | crontab -u buzau -

# Setup PM2 startup
echo "🚀 Configuring PM2 startup..."
su - buzau -c "pm2 startup systemd"

# Install PM2 startup script
env PATH=$PATH:/usr/bin pm2 startup systemd -u buzau --hp /home/buzau

echo "✅ Hetzner VPS setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update DNS to point your domain to this server's IP"
echo "2. Run: certbot --nginx -d your-domain.com -d www.your-domain.com"
echo "3. Push your code to GitHub to trigger deployment"
echo ""
echo "💰 Monthly cost: €4.55 (€3.79 server + €0.76 backup)"
echo "🎯 Your app will be available at: http://your-server-ip"