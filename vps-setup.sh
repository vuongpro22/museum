#!/bin/bash

echo "=== VPS Setup Script for Museum Project ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Java 17
print_status "Installing Java 17..."
apt install openjdk-17-jdk -y
java -version

# Install MySQL
print_status "Installing MySQL..."
apt install mysql-server -y
systemctl start mysql
systemctl enable mysql

# Configure MySQL
print_status "Configuring MySQL database..."
mysql -u root -e "
CREATE DATABASE IF NOT EXISTS museum;
CREATE USER IF NOT EXISTS 'vuongpro'@'%' IDENTIFIED BY 'Vuong@68';
GRANT ALL PRIVILEGES ON museum.* TO 'vuongpro'@'%';
FLUSH PRIVILEGES;
"

# Install Nginx
print_status "Installing Nginx..."
apt install nginx -y
systemctl start nginx
systemctl enable nginx

# Create project directories
print_status "Creating project directories..."
mkdir -p /var/www/museum/backend
mkdir -p /var/www/museum/frontend

# Create backend startup script
print_status "Creating backend startup script..."
cat > /var/www/museum/backend/start-backend.sh << 'EOF'
#!/bin/bash

# Đi đến thư mục backend
cd /var/www/museum/backend

# Dừng process cũ nếu có
pkill -f "museum-0.0.1-SNAPSHOT.jar"

# Khởi động backend với nohup
nohup java -jar museum-0.0.1-SNAPSHOT.jar > backend.log 2>&1 &

# Lưu PID
echo $! > backend.pid

echo "Backend started with PID: $(cat backend.pid)"
EOF

# Create backend stop script
print_status "Creating backend stop script..."
cat > /var/www/museum/backend/stop-backend.sh << 'EOF'
#!/bin/bash

# Đọc PID từ file
if [ -f /var/www/museum/backend/backend.pid ]; then
    PID=$(cat /var/www/museum/backend/backend.pid)
    echo "Stopping backend with PID: $PID"
    kill $PID
    rm /var/www/museum/backend/backend.pid
    echo "Backend stopped"
else
    echo "No PID file found, trying to kill by process name"
    pkill -f "museum-0.0.1-SNAPSHOT.jar"
fi
EOF

# Make scripts executable
chmod +x /var/www/museum/backend/start-backend.sh
chmod +x /var/www/museum/backend/stop-backend.sh

# Create Nginx configuration
print_status "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/museum << 'EOF'
server {
    listen 80;
    server_name binhvuong.id.vn www.binhvuong.id.vn;

    # Frontend - serve static files
    location / {
        root /var/www/museum/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Enable site
print_status "Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/museum /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    print_status "Nginx configuration applied successfully"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Install Certbot for SSL
print_status "Installing Certbot for SSL..."
apt install certbot python3-certbot-nginx -y

# Configure firewall
print_status "Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

print_status "=== VPS Setup completed successfully! ==="
print_warning "Next steps:"
echo "1. Run the deploy script from your local machine"
echo "2. Set up SSL certificate: certbot --nginx -d binhvuong.id.vn -d www.binhvuong.id.vn"
echo "3. Test your application at: https://binhvuong.id.vn"

