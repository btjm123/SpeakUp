# Instance role: SSM Session Manager access only (no SSH key pair needed).

resource "aws_iam_role" "server" {
  name = "${var.project_name}-server"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.server.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Lets the CloudWatch Agent on this box push memory/disk metrics.
resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.server.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Lets Grafana (running on this same box) read CloudWatch metrics via the
# instance's own credentials, for the system-metrics dashboard.
resource "aws_iam_role_policy_attachment" "cloudwatch_read" {
  role       = aws_iam_role.server.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchReadOnlyAccess"
}

resource "aws_iam_instance_profile" "server" {
  name = "${var.project_name}-server"
  role = aws_iam_role.server.name
}
