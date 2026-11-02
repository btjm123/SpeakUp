# CI deploy user for GitHub Actions.
#
# Note: this account's organization SCP blocks iam:CreateOpenIDConnectProvider,
# which rules out the usual no-stored-secrets GitHub OIDC approach. Falling back
# to a long-lived access key scoped to exactly what the deploy workflow needs:
# sync the client to S3, invalidate CloudFront, and trigger the server redeploy via SSM.

resource "aws_iam_user" "github_ci" {
  name = "${var.project_name}-github-actions"
}

resource "aws_iam_access_key" "github_ci" {
  user = aws_iam_user.github_ci.name
}

data "aws_iam_policy_document" "github_ci" {
  statement {
    sid    = "ClientBucketSync"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.client.arn,
      "${aws_s3_bucket.client.arn}/*",
    ]
  }

  statement {
    sid       = "CloudFrontInvalidate"
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [aws_cloudfront_distribution.client.arn]
  }

  statement {
    sid    = "ServerRedeploy"
    effect = "Allow"
    actions = [
      "ssm:SendCommand",
    ]
    resources = [
      aws_instance.server.arn,
      "arn:aws:ssm:${var.aws_region}::document/AWS-RunShellScript",
    ]
  }

  statement {
    sid    = "ServerRedeployStatus"
    effect = "Allow"
    actions = [
      "ssm:GetCommandInvocation",
      "ssm:ListCommandInvocations",
    ]
    # These SSM read APIs don't support resource-level restriction by instance/command.
    resources = ["*"]
  }
}

resource "aws_iam_user_policy" "github_ci" {
  name   = "${var.project_name}-deploy"
  user   = aws_iam_user.github_ci.name
  policy = data.aws_iam_policy_document.github_ci.json
}
