#!/usr/bin/env bash
# Pull the latest code on the server, rebuild, and restart the systemd service — via SSM (no SSH).
set -euo pipefail

AWS_PROFILE="speakup"
REGION="ap-southeast-2"
TF_DIR="$(cd "$(dirname "$0")/../terraform" && pwd)"

INSTANCE_ID=$(terraform -chdir="$TF_DIR" output -raw server_instance_id)

CMD="sudo -u ubuntu bash -c 'cd /opt/speakup && git pull && yarn install && (cd apps/server && yarn build)' && systemctl restart speakup-server"

COMMAND_ID=$(aws ssm send-command \
  --profile "$AWS_PROFILE" \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"$CMD\"]" \
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
