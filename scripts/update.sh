#!/bin/bash
# ===========================================
# King Neon - Update & Redeploy
# ===========================================
# Quick redeploy after code changes
# Usage: ./scripts/update.sh

set -e

STACK_NAME="king-neon"

echo "🔄 Updating King Neon Production..."
echo ""

# Pull latest code (if using git)
if [ -d ".git" ]; then
  echo "📥 Pulling latest code..."
  git pull origin main
fi

# Rebuild images
echo "🔨 Rebuilding images..."
./scripts/build-images.sh prod

# Update stack (rolling update)
echo "📦 Updating stack..."
docker stack deploy -c docker-stack.prod.yml $STACK_NAME

echo ""
echo "✅ Update deployed!"
echo ""
echo "Monitor rollout:"
echo "  docker service ls"
echo "  docker service ps ${STACK_NAME}_api"
