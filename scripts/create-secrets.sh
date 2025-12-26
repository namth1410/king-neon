#!/bin/bash
# ===========================================
# King Neon - Create Docker Secrets
# ===========================================
# Run this ONCE before first deployment
# Usage: ./scripts/create-secrets.sh

set -e

echo "🔐 Creating Docker Swarm secrets..."

# Check if swarm is initialized
if ! docker info 2>/dev/null | grep -q "Swarm: active"; then
  echo "⚠️  Docker Swarm not initialized. Initializing..."
  docker swarm init
fi

# Function to create secret if not exists
create_secret() {
  local name=$1
  local value=$2
  
  if docker secret inspect "$name" >/dev/null 2>&1; then
    echo "  ⏭️  Secret '$name' already exists, skipping..."
  else
    echo "$value" | docker secret create "$name" -
    echo "  ✅ Created secret: $name"
  fi
}

# Prompt for secrets or use defaults
echo ""
echo "Enter secret values (or press Enter for defaults):"
echo ""

read -p "Database User [king_neon]: " DB_USER
DB_USER=${DB_USER:-king_neon}

read -sp "Database Password [king_neon_secret]: " DB_PASSWORD
DB_PASSWORD=${DB_PASSWORD:-king_neon_secret}
echo ""

read -sp "JWT Secret [auto-generate]: " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
  JWT_SECRET=$(openssl rand -base64 32)
fi
echo ""

read -sp "Stripe Secret Key [sk_test_xxx]: " STRIPE_SECRET
STRIPE_SECRET=${STRIPE_SECRET:-sk_test_placeholder}
echo ""

read -sp "Stripe Webhook Secret [whsec_xxx]: " STRIPE_WEBHOOK
STRIPE_WEBHOOK=${STRIPE_WEBHOOK:-whsec_placeholder}
echo ""

read -p "MinIO User [king_neon_minio]: " MINIO_USER
MINIO_USER=${MINIO_USER:-king_neon_minio}

read -sp "MinIO Password [king_neon_minio_secret]: " MINIO_PASSWORD
MINIO_PASSWORD=${MINIO_PASSWORD:-king_neon_minio_secret}
echo ""

# Create secrets
echo ""
echo "Creating secrets..."
create_secret "db_user" "$DB_USER"
create_secret "db_password" "$DB_PASSWORD"
create_secret "jwt_secret" "$JWT_SECRET"
create_secret "stripe_secret" "$STRIPE_SECRET"
create_secret "stripe_webhook_secret" "$STRIPE_WEBHOOK"
create_secret "minio_user" "$MINIO_USER"
create_secret "minio_password" "$MINIO_PASSWORD"

echo ""
echo "✅ All secrets created!"
echo ""
echo "To list secrets: docker secret ls"
echo "To remove a secret: docker secret rm <name>"
