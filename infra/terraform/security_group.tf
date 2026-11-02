resource "aws_security_group" "server" {
  name        = "${var.project_name}-server"
  description = "SpeakUp server: HTTP/HTTPS from the internet, no inbound SSH (SSM Session Manager is used instead)."
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP (also used for ACME HTTP-01 challenge)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS / WSS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
