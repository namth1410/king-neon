#!/bin/bash
# ===========================================
# King Neon - Deploy Development Stack
# ===========================================
# Usage: ./scripts/deploy-dev.sh
# NOTE: Dev stack uses different ports to run alongside prod

set -e

STACK_NAME="king-neon-dev"

echo "🚀 Deploying King Neon Development Stack..."
echo ""

# Check if swarm is initialized
if ! docker info 2>/dev/null | grep -q "Swarm: active"; then
  echo "⚠️  Docker Swarm not initialized. Initializing..."
  docker swarm init
fi

# Check if .env.dev exists
if [ -f ".env.dev" ]; then
  echo "📄 Loading .env.dev..."
  set -a
  source .env.dev
  set +a
fi

# Build images with dev tag
echo "🔨 Building images..."
./scripts/build-images.sh dev

# Deploy stack
echo ""
echo "📦 Deploying stack..."
docker stack deploy -c docker-stack.dev.yml $STACK_NAME

echo ""
echo "✅ Dev stack deployed successfully!"
echo ""
echo "┌─────────────────────────────────────────────────────┐"
echo "│  Development Services (separate from prod)         │"
echo "├─────────────────────────────────────────────────────┤"
echo "│  API:   http://localhost:4010                      │"
echo "│  Web:   http://localhost:3010                      │"
echo "│  Admin: http://localhost:3011                      │"
echo "│  CMS:   http://localhost:1347                      │"
echo "│  MinIO: http://localhost:9011 (console)            │"
echo "├─────────────────────────────────────────────────────┤"
echo "│  Useful commands:                                  │"
echo "│    docker stack services $STACK_NAME               │"
echo "│    docker stack ps $STACK_NAME                     │"
echo "│    docker service logs ${STACK_NAME}_api -f        │"
echo "└─────────────────────────────────────────────────────┘"

