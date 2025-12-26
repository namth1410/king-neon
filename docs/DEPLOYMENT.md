# 🚀 Hướng Dẫn Deploy King Neon lên VPS

## 📋 Yêu Cầu Hệ Thống

### Phần cứng tối thiểu

- **CPU**: 2 cores
- **RAM**: 4GB (khuyến nghị 8GB)
- **Storage**: 40GB SSD
- **OS**: Ubuntu 22.04 LTS / Debian 12

### Phần mềm cần cài đặt

- Docker & Docker Compose
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Nginx (reverse proxy)
- Git
- PM2 (process manager)

---

## 📁 Cấu Trúc Dự Án

```
king-neon/
├── apps/
│   ├── web/       # Next.js Frontend (port 3000)
│   ├── admin/     # Next.js Admin Panel (port 3001)
│   └── api/       # NestJS Backend (port 4000)
├── packages/      # Shared packages
└── docker-compose.yml  # Infrastructure services
```

---

## 🛠️ Bước 1: Cài Đặt Môi Trường VPS

### 1.1 Cập nhật hệ thống

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Cài đặt Docker

```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user vào docker group
sudo usermod -aG docker $USER

# Cài đặt Docker Compose plugin
sudo apt install docker-compose-plugin -y
```

### 1.3 Cài đặt Node.js (via nvm)

```bash
# Cài đặt nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc

# Cài đặt Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

### 1.4 Cài đặt pnpm

```bash
npm install -g pnpm@9
```

### 1.5 Cài đặt PM2

```bash
npm install -g pm2
```

### 1.6 Cài đặt Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

---

## 📦 Bước 2: Clone & Setup Project

### 2.1 Clone repository

```bash
cd /var/www
git clone <YOUR_REPO_URL> king-neon
cd king-neon
```

### 2.2 Cài đặt dependencies

```bash
pnpm install
```

### 2.3 Tạo file .env

```bash
cp .env.example .env
nano .env
```

### 2.4 Cấu hình Production Environment

```env
# Database
DATABASE_URL=postgresql://king_neon:STRONG_PASSWORD_HERE@localhost:5434/king_neon_db

# Redis
REDIS_URL=redis://localhost:6380

# MinIO
MINIO_ENDPOINT=your-domain.com
MINIO_PORT=9002
MINIO_ROOT_USER=king_neon_minio
MINIO_ROOT_PASSWORD=STRONG_MINIO_SECRET_HERE
MINIO_BUCKET=king-neon
MINIO_USE_SSL=true

# JWT
JWT_SECRET=GENERATE_A_STRONG_SECRET_KEY_64_CHARS
JWT_EXPIRES_IN=7d

# API
API_URL=https://api.your-domain.com
API_PORT=4000

# Web
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

> ⚠️ **Quan trọng**: Thay đổi tất cả passwords và secrets trong production!

---

## 🐳 Bước 3: Khởi Chạy Infrastructure Services

### 3.1 Cập nhật docker-compose.yml cho production

Sửa file `docker-compose.yml` thay đổi passwords:

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: STRONG_PASSWORD_HERE # Thay đổi
    # Xóa ports trong production (chỉ expose trong Docker network)
    # ports:
    #   - "5434:5432"

  redis:
    # Thêm password cho Redis
    command: redis-server --requirepass REDIS_PASSWORD

  minio:
    environment:
      MINIO_ROOT_PASSWORD: STRONG_MINIO_SECRET_HERE # Thay đổi
```

### 3.2 Khởi chạy Docker services

```bash
docker compose up -d

# Kiểm tra trạng thái
docker compose ps
docker compose logs -f
```

---

## 🏗️ Bước 4: Build & Deploy Applications

### 4.1 Build tất cả các apps

```bash
pnpm build
```

### 4.2 Tạo PM2 ecosystem file

Tạo file `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "king-neon-web",
      cwd: "./apps/web",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "king-neon-admin",
      cwd: "./apps/admin",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "king-neon-api",
      cwd: "./apps/api",
      script: "npm",
      args: "run start:prod",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
```

### 4.3 Chạy Database Migration & Seed (nếu có)

```bash
cd apps/api
pnpm seed  # Chạy seed data nếu cần
cd ../..
```

### 4.4 Khởi chạy với PM2

```bash
pm2 start ecosystem.config.js

# Lưu cấu hình để tự động restart khi reboot
pm2 save
pm2 startup
```

---

## 🌐 Bước 5: Cấu Hình Nginx Reverse Proxy

### 5.1 Tạo configuration cho web app

```bash
sudo nano /etc/nginx/sites-available/king-neon-web
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.2 Tạo configuration cho admin

```bash
sudo nano /etc/nginx/sites-available/king-neon-admin
```

```nginx
server {
    listen 80;
    server_name admin.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.3 Tạo configuration cho API

```bash
sudo nano /etc/nginx/sites-available/king-neon-api
```

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    client_max_body_size 50M;  # Cho phép upload file lớn

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.4 Enable các sites

```bash
sudo ln -s /etc/nginx/sites-available/king-neon-web /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/king-neon-admin /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/king-neon-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Bước 6: Cài Đặt SSL với Certbot

```bash
# Cài đặt Certbot
sudo apt install certbot python3-certbot-nginx -y

# Lấy certificate cho tất cả domains
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d admin.your-domain.com -d api.your-domain.com

# Tự động renew
sudo certbot renew --dry-run
```

---

## 🔥 Bước 7: Cấu Hình Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Kiểm tra status
sudo ufw status
```

---

## 📊 Bước 8: Monitoring & Logs

### 8.1 PM2 Monitoring

```bash
# Xem status các apps
pm2 status

# Xem logs
pm2 logs

# Xem logs của app cụ thể
pm2 logs king-neon-api

# Monitor realtime
pm2 monit
```

### 8.2 Docker Logs

```bash
# Xem logs tất cả services
docker compose logs -f

# Xem logs service cụ thể
docker compose logs -f postgres
```

### 8.3 Setup PM2 Web Dashboard (optional)

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔄 Quy Trình Update/Redeploy

```bash
# 1. Pull code mới
cd /var/www/king-neon
git pull origin main

# 2. Install dependencies (nếu có thay đổi)
pnpm install

# 3. Build lại
pnpm build

# 4. Restart applications
pm2 restart all

# Hoặc restart từng app
pm2 restart king-neon-web
pm2 restart king-neon-api
```

---

## ❗ Troubleshooting

### Lỗi kết nối Database

```bash
# Kiểm tra PostgreSQL đang chạy
docker compose ps postgres
docker compose logs postgres
```

### Lỗi Memory

```bash
# Kiểm tra memory usage
free -m
pm2 monit

# Tăng swap nếu cần
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### App không start

```bash
# Xem logs chi tiết
pm2 logs king-neon-api --lines 100

# Kiểm tra port đã được sử dụng
sudo lsof -i :4000
```

---

## � Bước 9: CI/CD Pipeline với GitHub Actions

### 9.1 Tạo GitHub Actions Workflow

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - main
      - develop # Cho dev environment
  workflow_dispatch: # Cho phép trigger manual

env:
  NODE_VERSION: "20"
  PNPM_VERSION: "9"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linting
        run: pnpm lint

      - name: Run tests
        run: pnpm test
        continue-on-error: true

      - name: Build all apps
        run: pnpm build

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to Production VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            cd /var/www/king-neon
            git fetch origin main
            git reset --hard origin/main

            # Install dependencies
            pnpm install --frozen-lockfile

            # Build apps
            pnpm build

            # Restart services
            pm2 restart ecosystem.config.js --update-env

            # Health check
            sleep 5
            curl -f http://localhost:3000 || exit 1
            curl -f http://localhost:4000/health || exit 1

            echo "✅ Production deployment completed!"

  deploy-development:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: development
    steps:
      - name: Deploy to Development VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DEV_VPS_HOST }}
          username: ${{ secrets.DEV_VPS_USERNAME }}
          key: ${{ secrets.DEV_VPS_SSH_KEY }}
          port: ${{ secrets.DEV_VPS_PORT }}
          script: |
            cd /var/www/king-neon-dev
            git fetch origin develop
            git reset --hard origin/develop

            pnpm install --frozen-lockfile
            pnpm build

            pm2 restart ecosystem.dev.config.js --update-env

            echo "✅ Development deployment completed!"
```

### 9.2 Cấu hình GitHub Secrets

Vào **Repository Settings > Secrets and variables > Actions**, thêm các secrets:

| Secret Name        | Mô tả                                         |
| ------------------ | --------------------------------------------- |
| `VPS_HOST`         | IP hoặc domain của VPS production             |
| `VPS_USERNAME`     | Username SSH (thường là `root` hoặc `deploy`) |
| `VPS_SSH_KEY`      | Private SSH key để kết nối VPS                |
| `VPS_PORT`         | SSH port (mặc định `22`)                      |
| `DEV_VPS_HOST`     | IP của VPS development                        |
| `DEV_VPS_USERNAME` | Username SSH cho dev                          |
| `DEV_VPS_SSH_KEY`  | Private SSH key cho dev                       |
| `DEV_VPS_PORT`     | SSH port cho dev                              |

### 9.3 Tạo SSH Key cho Deploy

```bash
# Trên local machine
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy

# Copy public key lên VPS
ssh-copy-id -i ~/.ssh/github_deploy.pub user@your-vps-ip

# Lấy private key để paste vào GitHub Secrets
cat ~/.ssh/github_deploy
```

### 9.4 Webhook Alternative (Self-hosted)

Nếu không muốn dùng GitHub Actions, tạo webhook endpoint:

```bash
# Cài đặt webhook
sudo apt install webhook -y

# Tạo file hooks.json
sudo nano /etc/webhook/hooks.json
```

```json
[
  {
    "id": "deploy-king-neon",
    "execute-command": "/var/www/king-neon/scripts/deploy.sh",
    "command-working-directory": "/var/www/king-neon",
    "pass-arguments-to-command": [{ "source": "payload", "name": "ref" }],
    "trigger-rule": {
      "and": [
        {
          "match": {
            "type": "payload-hmac-sha256",
            "secret": "YOUR_WEBHOOK_SECRET",
            "parameter": { "source": "header", "name": "X-Hub-Signature-256" }
          }
        },
        {
          "match": {
            "type": "value",
            "value": "refs/heads/main",
            "parameter": { "source": "payload", "name": "ref" }
          }
        }
      ]
    }
  }
]
```

Tạo script deploy:

```bash
# /var/www/king-neon/scripts/deploy.sh
#!/bin/bash
set -e

cd /var/www/king-neon

echo "📦 Pulling latest code..."
git fetch origin main
git reset --hard origin/main

echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔨 Building..."
pnpm build

echo "🔄 Restarting services..."
pm2 restart ecosystem.config.js --update-env

echo "✅ Deployment completed at $(date)"
```

```bash
chmod +x /var/www/king-neon/scripts/deploy.sh
```

---

## 🧪 Bước 10: Setup Môi Trường Development

### 10.1 Cấu trúc 2 môi trường

```
VPS
├── /var/www/king-neon/        # Production
│   ├── .env.production
│   └── ecosystem.config.js
│
└── /var/www/king-neon-dev/    # Development
    ├── .env.development
    └── ecosystem.dev.config.js
```

### 10.2 Docker Compose cho Development

Tạo file `docker-compose.dev.yml`:

```yaml
services:
  postgres-dev:
    image: postgres:16-alpine
    container_name: king-neon-postgres-dev
    restart: unless-stopped
    environment:
      POSTGRES_USER: king_neon_dev
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: king_neon_dev_db
    ports:
      - "5435:5432" # Port khác với production
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis-dev:
    image: redis:7-alpine
    container_name: king-neon-redis-dev
    restart: unless-stopped
    ports:
      - "6381:6379" # Port khác với production
    volumes:
      - redis_dev_data:/data

  minio-dev:
    image: minio/minio:latest
    container_name: king-neon-minio-dev
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: dev_minio
      MINIO_ROOT_PASSWORD: dev_minio_secret
    ports:
      - "9004:9000"
      - "9005:9001"
    volumes:
      - minio_dev_data:/data

volumes:
  postgres_dev_data:
  redis_dev_data:
  minio_dev_data:
```

### 10.3 PM2 Ecosystem cho Development

Tạo `ecosystem.dev.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "king-neon-web-dev",
      cwd: "./apps/web",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "development",
        PORT: 3100, // Port khác production
      },
    },
    {
      name: "king-neon-admin-dev",
      cwd: "./apps/admin",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "development",
        PORT: 3101,
      },
    },
    {
      name: "king-neon-api-dev",
      cwd: "./apps/api",
      script: "npm",
      args: "run start:prod",
      env: {
        NODE_ENV: "development",
        PORT: 4100,
      },
    },
  ],
};
```

### 10.4 Environment Variables cho Dev

Tạo `.env.development`:

```env
# Database
DATABASE_URL=postgresql://king_neon_dev:dev_password@localhost:5435/king_neon_dev_db

# Redis
REDIS_URL=redis://localhost:6381

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9004
MINIO_ROOT_USER=dev_minio
MINIO_ROOT_PASSWORD=dev_minio_secret
MINIO_BUCKET=king-neon-dev

# JWT
JWT_SECRET=dev-jwt-secret-key-not-for-production
JWT_EXPIRES_IN=7d

# API
API_URL=https://dev-api.your-domain.com
API_PORT=4100

# Web
NEXT_PUBLIC_API_URL=https://dev-api.your-domain.com
```

### 10.5 Nginx cho Development

```nginx
# /etc/nginx/sites-available/king-neon-dev

server {
    listen 80;
    server_name dev.your-domain.com;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name dev-admin.your-domain.com;

    location / {
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name dev-api.your-domain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:4100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 10.6 Domain Structure với 2 môi trường

| Environment     | Service | Domain                    | Port |
| --------------- | ------- | ------------------------- | ---- |
| **Production**  | Web     | your-domain.com           | 3000 |
|                 | Admin   | admin.your-domain.com     | 3001 |
|                 | API     | api.your-domain.com       | 4000 |
| **Development** | Web     | dev.your-domain.com       | 3100 |
|                 | Admin   | dev-admin.your-domain.com | 3101 |
|                 | API     | dev-api.your-domain.com   | 4100 |

---

## 💾 Bước 11: Backup & Recovery

### 11.1 Script Backup Tự Động

Tạo file `/var/www/king-neon/scripts/backup.sh`:

```bash
#!/bin/bash
set -e

# ===========================================
# King Neon Backup Script
# ===========================================

# Configuration
BACKUP_DIR="/var/backups/king-neon"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Database credentials
DB_CONTAINER="king-neon-postgres"
DB_USER="king_neon"
DB_NAME="king_neon_db"

# MinIO credentials
MINIO_CONTAINER="king-neon-minio"

# Slack/Discord webhook (optional)
# WEBHOOK_URL="https://hooks.slack.com/services/xxx"

# Create backup directory
mkdir -p "$BACKUP_DIR"/{database,minio,volumes}

echo "🔵 Starting backup at $(date)"

# ===========================================
# 1. Database Backup
# ===========================================
echo "📦 Backing up PostgreSQL database..."

docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME -F c -f /tmp/backup.dump

docker cp $DB_CONTAINER:/tmp/backup.dump "$BACKUP_DIR/database/db_${DATE}.dump"

docker exec $DB_CONTAINER rm /tmp/backup.dump

# Compress
gzip "$BACKUP_DIR/database/db_${DATE}.dump"

echo "✅ Database backup completed: db_${DATE}.dump.gz"

# ===========================================
# 2. MinIO/S3 Backup
# ===========================================
echo "📦 Backing up MinIO data..."

# Option 1: Using mc (MinIO Client)
if command -v mc &> /dev/null; then
    mc mirror minio/king-neon "$BACKUP_DIR/minio/${DATE}/" --overwrite
else
    # Option 2: Volume backup
    docker run --rm \
        -v king-neon_minio_data:/source:ro \
        -v "$BACKUP_DIR/minio":/backup \
        alpine tar czf "/backup/minio_${DATE}.tar.gz" -C /source .
fi

echo "✅ MinIO backup completed"

# ===========================================
# 3. Redis Backup (RDB snapshot)
# ===========================================
echo "📦 Backing up Redis..."

docker exec king-neon-redis redis-cli BGSAVE
sleep 5

docker cp king-neon-redis:/data/dump.rdb "$BACKUP_DIR/volumes/redis_${DATE}.rdb"

echo "✅ Redis backup completed"

# ===========================================
# 4. Application configs backup
# ===========================================
echo "📦 Backing up application configs..."

tar czf "$BACKUP_DIR/volumes/configs_${DATE}.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='dist' \
    /var/www/king-neon/.env* \
    /var/www/king-neon/ecosystem.config.js \
    /var/www/king-neon/docker-compose.yml

echo "✅ Config backup completed"

# ===========================================
# 5. Cleanup old backups
# ===========================================
echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."

find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -type d -empty -delete

# ===========================================
# 6. Upload to remote storage (optional)
# ===========================================
# Uncomment to enable S3/GCS backup

# AWS S3
# aws s3 sync "$BACKUP_DIR" s3://your-backup-bucket/king-neon/

# Google Cloud Storage
# gsutil -m rsync -r "$BACKUP_DIR" gs://your-backup-bucket/king-neon/

# Backblaze B2
# rclone sync "$BACKUP_DIR" b2:your-backup-bucket/king-neon/

# ===========================================
# 7. Send notification (optional)
# ===========================================
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

# Slack notification
# curl -X POST -H 'Content-type: application/json' \
#     --data "{\"text\":\"✅ King Neon backup completed\\nSize: $BACKUP_SIZE\\nTime: $(date)\"}" \
#     $WEBHOOK_URL

echo "🟢 Backup completed successfully at $(date)"
echo "📊 Total backup size: $BACKUP_SIZE"
```

```bash
chmod +x /var/www/king-neon/scripts/backup.sh
```

### 11.2 Cron Job cho Backup Tự Động

```bash
# Mở crontab
crontab -e

# Thêm các dòng sau:

# Backup hàng ngày lúc 2:00 AM
0 2 * * * /var/www/king-neon/scripts/backup.sh >> /var/log/king-neon-backup.log 2>&1

# Backup database mỗi 6 tiếng (cho production critical)
0 */6 * * * /var/www/king-neon/scripts/backup-db-only.sh >> /var/log/king-neon-backup.log 2>&1
```

### 11.3 Script Backup Database Only

Tạo `/var/www/king-neon/scripts/backup-db-only.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/king-neon/database"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

docker exec king-neon-postgres pg_dump -U king_neon -d king_neon_db -F c | gzip > "$BACKUP_DIR/db_${DATE}.dump.gz"

# Giữ lại 20 bản backup database gần nhất
cd "$BACKUP_DIR" && ls -t *.gz | tail -n +21 | xargs -r rm --

echo "$(date) - Database backup completed: db_${DATE}.dump.gz"
```

### 11.4 Script Restore

Tạo `/var/www/king-neon/scripts/restore.sh`:

```bash
#!/bin/bash
set -e

# ===========================================
# King Neon Restore Script
# ===========================================

BACKUP_DIR="/var/backups/king-neon"

echo "📋 Available backups:"
echo ""
echo "=== Database backups ==="
ls -la "$BACKUP_DIR/database/" | tail -10
echo ""
echo "=== MinIO backups ==="
ls -la "$BACKUP_DIR/minio/" | tail -5
echo ""

read -p "Enter database backup filename (e.g., db_20241222_020000.dump.gz): " DB_BACKUP
read -p "Are you sure you want to restore? This will OVERWRITE current data! (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 1
fi

echo "🔴 STOPPING all services..."
pm2 stop all

# ===========================================
# Restore Database
# ===========================================
echo "📦 Restoring database..."

# Decompress if needed
if [[ "$DB_BACKUP" == *.gz ]]; then
    gunzip -k "$BACKUP_DIR/database/$DB_BACKUP"
    DB_BACKUP="${DB_BACKUP%.gz}"
fi

# Drop and recreate database
docker exec king-neon-postgres psql -U king_neon -c "DROP DATABASE IF EXISTS king_neon_db;"
docker exec king-neon-postgres psql -U king_neon -c "CREATE DATABASE king_neon_db;"

# Restore
docker cp "$BACKUP_DIR/database/$DB_BACKUP" king-neon-postgres:/tmp/restore.dump
docker exec king-neon-postgres pg_restore -U king_neon -d king_neon_db /tmp/restore.dump
docker exec king-neon-postgres rm /tmp/restore.dump

echo "✅ Database restored"

# ===========================================
# Restart services
# ===========================================
echo "🔵 Starting services..."
pm2 start all

echo "🟢 Restore completed at $(date)"
```

### 11.5 Backup sang Remote Storage

#### Option A: Sử dụng rclone

```bash
# Cài đặt rclone
curl https://rclone.org/install.sh | sudo bash

# Cấu hình
rclone config

# Sync backup lên cloud
rclone sync /var/backups/king-neon remote:king-neon-backups
```

#### Option B: Sử dụng rsync sang backup server

```bash
# Thêm vào backup.sh
rsync -avz --delete "$BACKUP_DIR/" backup-user@backup-server:/backups/king-neon/
```

### 11.6 Monitoring Backup

Tạo script check backup health:

```bash
#!/bin/bash
# /var/www/king-neon/scripts/check-backup.sh

BACKUP_DIR="/var/backups/king-neon"
MAX_AGE_HOURS=24

# Kiểm tra backup mới nhất
LATEST_BACKUP=$(find "$BACKUP_DIR/database" -name "*.gz" -mmin -$((MAX_AGE_HOURS * 60)) | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "⚠️ WARNING: No backup found in last $MAX_AGE_HOURS hours!"
    # Send alert
    # curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
    #     -d "chat_id=<CHAT_ID>&text=⚠️ King Neon backup failed!"
    exit 1
else
    echo "✅ Latest backup: $LATEST_BACKUP"
    exit 0
fi
```

---

## �📝 Checklist Deploy

- [ ] Cài đặt Docker & Docker Compose
- [ ] Cài đặt Node.js, pnpm, PM2
- [ ] Clone repository
- [ ] Cấu hình file `.env` với production values
- [ ] Thay đổi passwords trong `docker-compose.yml`
- [ ] Khởi chạy Docker services
- [ ] Build tất cả apps
- [ ] Tạo `ecosystem.config.js`
- [ ] Chạy migration/seed data
- [ ] Khởi chạy apps với PM2
- [ ] Cấu hình Nginx reverse proxy
- [ ] Cài đặt SSL với Certbot
- [ ] Cấu hình Firewall
- [ ] Test tất cả endpoints
- [ ] Setup monitoring

---

## 🌐 Domain Structure

| Service       | Domain                  | Port |
| ------------- | ----------------------- | ---- |
| Web           | your-domain.com         | 3000 |
| Admin         | admin.your-domain.com   | 3001 |
| API           | api.your-domain.com     | 4000 |
| MinIO Console | storage.your-domain.com | 9003 |
