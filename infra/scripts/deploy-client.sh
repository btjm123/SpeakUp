#!/usr/bin/env bash
# Build apps/client against the production API and sync it to S3 + invalidate CloudFront.
set -euo pipefail

AWS_PROFILE="speakup"
REGION="ap-southeast-2"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TF_DIR="$REPO_ROOT/infra/terraform"

BUCKET=$(terraform -chdir="$TF_DIR" output -raw client_bucket_name)
DISTRIBUTION_ID=$(terraform -chdir="$TF_DIR" output -raw cloudfront_distribution_id)

echo "Building client..."
VITE_SERVER_HOST=api.speakup.benntan.com VITE_SERVER_PROTOCOL=https \
  yarn --cwd "$REPO_ROOT/apps/client" build

echo "Syncing to s3://$BUCKET ..."
aws s3 sync "$REPO_ROOT/apps/client/dist" "s3://$BUCKET" --delete --profile "$AWS_PROFILE" --region "$REGION"

echo "Invalidating CloudFront distribution $DISTRIBUTION_ID ..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" --profile "$AWS_PROFILE"

echo "Done. https://speakup.benntan.com"
