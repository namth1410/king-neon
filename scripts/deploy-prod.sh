#!/bin/bash
# ===========================================
# King Neon - Deploy Production Stack
# ===========================================
# For single VPS with Cloudflare Tunnel
# Usage: ./scripts/deploy-prod.sh

set -e

STACK_NAME="king-neon"

echo "🚀 Deploying King Neon Production Stack..."
echo ""

# Check if swarm is initialized
if ! docker info 2>/dev/null | grep -q "Swarm: active"; then
  echo "⚠️  Docker Swarm not initialized. Initializing..."
  docker swarm init
fi

# Check if .env.prod exists
if [ ! -f ".env.prod" ]; then
  echo "❌ .env.prod file not found!"
  echo "   Copy .env.prod.example to .env.prod and fill in the values"
  exit 1
fi

# Load environment variables
set -a
source .env.prod
set +a

# Check required env vars
REQUIRED_VARS=("JWT_SECRET" "POSTGRES_PASSWORD")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "❌ Missing required environment variables: ${MISSING_VARS[*]}"
  echo "   Please set them in .env.prod"
  exit 1
fi
echo "✅ Environment variables loaded"

# Check if images exist, build if not
echo "🐳 Checking images..."
REQUIRED_IMAGES=("king-neon-api:latest" "king-neon-web:latest" "king-neon-admin:latest" "king-neon-cms:latest")
MISSING_IMAGES=()

for image in "${REQUIRED_IMAGES[@]}"; do
  if ! docker image inspect "$image" >/dev/null 2>&1; then
    MISSING_IMAGES+=("$image")
  fi
done

if [ ${#MISSING_IMAGES[@]} -gt 0 ]; then
  echo "⚠️  Missing images: ${MISSING_IMAGES[*]}"
  echo "   Building images first..."
  ./scripts/build-images.sh prod
else
  echo "✅ All images present"
fi

# Deploy stack
echo ""
echo "📦 Deploying stack..."
docker stack deploy -c docker-stack.prod.yml $STACK_NAME --with-registry-auth

echo ""
echo "✅ Stack deployed successfully!"
echo ""
echo "┌─────────────────────────────────────────────────────┐"
echo "│  Services will start in ~30-60 seconds             │"
echo "├─────────────────────────────────────────────────────┤"
echo "│  Useful commands:                                  │"
echo "│    docker stack services $STACK_NAME               │"
echo "│    docker stack ps $STACK_NAME                     │"
echo "│    docker service logs ${STACK_NAME}_api -f        │"
echo "│                                                    │"
echo "│  Check health:                                     │"
echo "│    docker service ps ${STACK_NAME}_api             │"
echo "└─────────────────────────────────────────────────────┘"
