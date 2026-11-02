resource "aws_instance" "server" {
  ami                    = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnet.selected.id
  vpc_security_group_ids = [aws_security_group.server.id]
  iam_instance_profile   = aws_iam_instance_profile.server.name

  metadata_options {
    http_tokens                = "required"
    http_put_response_hop_limit = 1
    http_endpoint              = "enabled"
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = templatefile("${path.module}/templates/user_data.sh.tpl", {
    project_name     = var.project_name
    github_repo_url  = var.github_repo_url
    github_branch    = var.github_branch
    api_subdomain    = var.api_subdomain
  })
  user_data_replace_on_change = true

  tags = {
    Name = "${var.project_name}-server"
  }
}

resource "aws_eip" "server" {
  instance = aws_instance.server.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-server"
  }
}
