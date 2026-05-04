# Hướng dẫn Deploy Museum Project lên VPS

## Thông tin VPS
- **IP**: 36.50.54.237
- **Domain**: binhvuong.id.vn
- **User**: root

## Bước 1: Chuẩn bị môi trường VPS

### 1.1. Cài đặt Java 17
```bash
# SSH vào VPS
ssh root@36.50.54.237

# Cập nhật hệ thống
apt update && apt upgrade -y

# Cài đặt Java 17
apt install openjdk-17-jdk -y

# Kiểm tra Java version
java -version
```

### 1.2. Cài đặt MySQL
```bash
# Cài đặt MySQL
apt install mysql-server -y

# Khởi động MySQL
systemctl start mysql
systemctl enable mysql

# Tạo database và user
mysql -u root -p
```

Trong MySQL console:
```sql
CREATE DATABASE museum;
CREATE USER 'vuongpro'@'%' IDENTIFIED BY 'Vuong@68';
GRANT ALL PRIVILEGES ON museum.* TO 'vuongpro'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### 1.3. Cài đặt Nginx
```bash
# Cài đặt Nginx
apt install nginx -y

# Khởi động Nginx
systemctl start nginx
systemctl enable nginx
```

### 1.4. Tạo thư mục project
```bash
# Tạo thư mục cho project
mkdir -p /var/www/museum
mkdir -p /var/www/museum/backend
mkdir -p /var/www/museum/frontend
```

## Bước 2: Build và Deploy Backend

### 2.1. Build backend trên local
```bash
# Trong thư mục backend
cd backend

# Build JAR file
mvn clean package -DskipTests

# File JAR sẽ được tạo tại: target/museum-0.0.1-SNAPSHOT.jar
```

### 2.2. Copy backend lên VPS
```bash
# Copy JAR file lên VPS
scp target/museum-0.0.1-SNAPSHOT.jar root@36.50.54.237:/var/www/museum/backend/

# Copy application.properties (nếu cần cập nhật)
scp src/main/resources/application.properties root@36.50.54.237:/var/www/museum/backend/
```

### 2.3. Tạo script khởi động backend
Trên VPS, tạo file script:
```bash
nano /var/www/museum/backend/start-backend.sh
```

Nội dung script:
```bash
#!/bin/bash

# Đi đến thư mục backend
cd /var/www/museum/backend

# Dừng process cũ nếu có
pkill -f "museum-0.0.1-SNAPSHOT.jar"

# Khởi động backend với nohup
nohup java -jar museum-0.0.1-SNAPSHOT.jar > backend.log 2>&1 &
nohup java -jar /var/www/museum/backend/museum-0.0.1-SNAPSHOT.jar > /var/www/museum/backend/logs/backend.log 2>&1 &
# Lưu PID
echo $! > backend.pid

echo "Backend started with PID: $(cat backend.pid)"
```

```bash
# Cấp quyền thực thi
chmod +x /var/www/museum/backend/start-backend.sh
```

### 2.4. Tạo script dừng backend
```bash
nano /var/www/museum/backend/stop-backend.sh
```

Nội dung:
```bash
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
```

```bash
chmod +x /var/www/museum/backend/stop-backend.sh
```

## Bước 3: Build và Deploy Frontend

### 3.1. Build frontend trên local
```bash
# Trong thư mục frontend
cd frontend

# Cài đặt dependencies (nếu chưa có)
npm install

# Build production
npm run build

# Thư mục dist sẽ được tạo chứa các file build
```

### 3.2. Copy frontend lên VPS
```bash
# Copy toàn bộ thư mục dist lên VPS
scp -r dist/* root@36.50.54.237:/var/www/museum/frontend/
```

## Bước 4: Cấu hình Nginx

### 4.1. Tạo cấu hình Nginx
```bash
nano /etc/nginx/sites-available/museum
```

Nội dung cấu hình:
```nginx
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
```

### 4.2. Kích hoạt site
```bash
# Tạo symbolic link
ln -s /etc/nginx/sites-available/museum /etc/nginx/sites-enabled/

# Xóa default site
rm /etc/nginx/sites-enabled/default

# Test cấu hình
nginx -t

# Reload Nginx
systemctl reload nginx
```

## Bước 5: Cài đặt SSL với Let's Encrypt

### 5.1. Cài đặt Certbot
```bash
# Cài đặt Certbot
apt install certbot python3-certbot-nginx -y
```

### 5.2. Tạo SSL certificate
```bash
# Tạo SSL certificate
certbot --nginx -d binhvuong.id.vn -d www.binhvuong.id.vn

# Tự động gia hạn
crontab -e
# Thêm dòng sau:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Bước 6: Khởi động và kiểm tra

### 6.1. Khởi động backend
```bash
# Khởi động backend
/var/www/museum/backend/start-backend.sh

# Kiểm tra log
tail -f /var/www/museum/backend/backend.log

# Kiểm tra process
ps aux | grep museum
```

### 6.2. Kiểm tra kết nối
```bash
# Kiểm tra backend API
curl http://localhost:8080/api/images

# Kiểm tra Nginx
curl http://localhost

# Kiểm tra từ bên ngoài
curl https://binhvuong.id.vn
```

## Bước 7: Script quản lý tự động

### 7.1. Tạo script deploy hoàn chỉnh
Tạo file `deploy.sh` trên local:

```bash
#!/bin/bash

echo "=== Museum Project Deployment ==="

# Build backend
echo "Building backend..."
cd backend
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "Backend build failed!"
    exit 1
fi

# Build frontend
echo "Building frontend..."
cd ../frontend
npm run build
if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    exit 1
fi

# Deploy backend
echo "Deploying backend..."
scp target/museum-0.0.1-SNAPSHOT.jar root@36.50.54.237:/var/www/museum/backend/

# Deploy frontend
echo "Deploying frontend..."
scp -r dist/* root@36.50.54.237:/var/www/museum/frontend/

# Restart backend
echo "Restarting backend..."
ssh root@36.50.54.237 "/var/www/museum/backend/stop-backend.sh && /var/www/museum/backend/start-backend.sh"

echo "Deployment completed!"
echo "Visit: https://binhvuong.id.vn"
```

```bash
chmod +x deploy.sh
```

### 7.2. Sử dụng script deploy
```bash
# Chạy deploy
./deploy.sh
```

## Bước 8: Monitoring và Logs

### 8.1. Xem logs backend
```bash
# Xem log realtime
tail -f /var/www/museum/backend/backend.log

# Xem log Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 8.2. Kiểm tra status
```bash
# Kiểm tra backend process
ps aux | grep museum

# Kiểm tra port 8080
netstat -tlnp | grep 8080

# Kiểm tra Nginx status
systemctl status nginx
```

## Troubleshooting

### Lỗi thường gặp:

1. **Backend không khởi động**:
   - Kiểm tra Java version: `java -version`
   - Kiểm tra log: `tail -f /var/www/museum/backend/backend.log`
   - Kiểm tra port 8080 có bị chiếm không: `netstat -tlnp | grep 8080`

2. **Database connection error**:
   - Kiểm tra MySQL service: `systemctl status mysql`
   - Kiểm tra database và user đã tạo chưa
   - Kiểm tra firewall: `ufw status`

3. **Frontend không load**:
   - Kiểm tra Nginx config: `nginx -t`
   - Kiểm tra file frontend có đúng path không
   - Kiểm tra Nginx error log

4. **SSL không hoạt động**:
   - Kiểm tra domain đã trỏ đúng IP chưa
   - Kiểm tra Certbot: `certbot certificates`
   - Renew certificate: `certbot renew`

## Lệnh hữu ích

```bash
# Restart toàn bộ
systemctl restart nginx
/var/www/museum/backend/stop-backend.sh
/var/www/museum/backend/start-backend.sh

# Xem disk usage
df -h

# Xem memory usage
free -h

# Xem top processes
top

# Kiểm tra firewall
ufw status
```

---

**Lưu ý**: Đảm bảo cập nhật Cloudinary credentials trong `application.properties` trước khi deploy!
