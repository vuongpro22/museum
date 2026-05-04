#!/bin/bash

echo "=== Museum Project Deployment ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# VPS configuration
VPS_HOST="root@36.50.54.237"
VPS_PATH="/var/www/museum"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the museum project root directory"
    exit 1
fi

# Build backend
print_status "Building backend..."
cd backend
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    print_error "Backend build failed!"
    exit 1
fi
print_status "Backend build completed successfully"

# Build frontend
print_status "Building frontend..."
cd ../frontend
npm run build
if [ $? -ne 0 ]; then
    print_error "Frontend build failed!"
    exit 1
fi
print_status "Frontend build completed successfully"

# Deploy backend
print_status "Deploying backend to VPS..."
scp target/museum-0.0.1-SNAPSHOT.jar $VPS_HOST:$VPS_PATH/backend/
if [ $? -ne 0 ]; then
    print_error "Backend deployment failed!"
    exit 1
fi
print_status "Backend deployed successfully"

# Deploy frontend
print_status "Deploying frontend to VPS..."
scp -r dist/* $VPS_HOST:$VPS_PATH/frontend/
if [ $? -ne 0 ]; then
    print_error "Frontend deployment failed!"
    exit 1
fi
print_status "Frontend deployed successfully"

# Restart backend
print_status "Restarting backend on VPS..."
ssh $VPS_HOST "$VPS_PATH/backend/stop-backend.sh && $VPS_PATH/backend/start-backend.sh"
if [ $? -ne 0 ]; then
    print_error "Backend restart failed!"
    exit 1
fi
print_status "Backend restarted successfully"

# Reload Nginx
print_status "Reloading Nginx configuration..."
ssh $VPS_HOST "systemctl reload nginx"
if [ $? -ne 0 ]; then
    print_warning "Nginx reload failed, but deployment completed"
else
    print_status "Nginx reloaded successfully"
fi

print_status "=== Deployment completed successfully! ==="
echo -e "${GREEN}Visit your museum at: https://binhvuong.id.vn${NC}"
echo -e "${YELLOW}Backend API: https://binhvuong.id.vn/api/images${NC}"

