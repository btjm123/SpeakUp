#!/usr/bin/env bash
# Run this once, AFTER the api_subdomain A record (from `terraform output server_public_ip`)
# has been added in Namecheap and has propagated (check with `dig api.speakup.benntan.com`).
# Issues a Let's Encrypt cert on the server via SSM — no SSH needed.
set -euo pipefail

cd "$(dirname "$0")/../terraform"

AWS_PROFILE="speakup"
REGION="ap-southeast-2"
INSTANCE_ID=$(terraform output -raw server_instance_id)
DOMAIN="${1:-api.speakup.benntan.com}"

echo "Requesting cert for $DOMAIN on instance $INSTANCE_ID..."

COMMAND_ID=$(aws ssm send-command \
  --profile "$AWS_PROFILE" \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN --redirect\"]" \
  --query "Command.CommandId" --output text)

echo "Command ID: $COMMAND_ID (waiting for result)..."
aws ssm wait command-executed --profile "$AWS_PROFILE" --region "$REGION" --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" || true

aws ssm get-command-invocation \
  --profile "$AWS_PROFILE" \
  --region "$REGION" \
  --command-id "$COMMAND_ID" \
  --instance-id "$INSTANCE_ID" \
  --query "{Status:Status,StdOut:StandardOutputContent,StdErr:StandardErrorContent}" \
  --output json
