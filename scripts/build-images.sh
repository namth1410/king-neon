#!/bin/bash
# ===========================================
# King Neon - Build Images Script
# ===========================================
# Usage: ./scripts/build-images.sh [dev|prod]

set -e

ENV=${1:-prod}
TAG=${2:-latest}

# Set API URL based on environment
if [ "$ENV" == "dev" ]; then
  TAG="dev"
  NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"http://localhost:4010/api"}
else
  NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"https://kingneon-api.namth.online/api"}
fi

echo "🔨 Building King Neon images (env: $ENV, tag: $TAG)..."
echo "📡 API URL: $NEXT_PUBLIC_API_URL"
echo ""

# Build API
echo "📦 Building API..."
docker build -t king-neon-api:$TAG -f apps/api/Dockerfile .

# Build Web
echo "📦 Building Web..."
docker build -t king-neon-web:$TAG \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -f apps/web/Dockerfile .

# Build Admin
echo "📦 Building Admin..."
docker build -t king-neon-admin:$TAG \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -f apps/admin/Dockerfile .

echo "✅ All images built successfully!"
echo ""
echo "Images:"
docker images | grep king-neon
