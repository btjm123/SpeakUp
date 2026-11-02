# Use the account's default VPC/subnet — this project doesn't need custom networking.

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Pick the first available subnet for the single instance.
data "aws_subnet" "selected" {
  id = sort(data.aws_subnets.default.ids)[0]
}

# Canonical's officially published SSM parameter for the latest Ubuntu 22.04 LTS AMI (amd64).
data "aws_ssm_parameter" "ubuntu_ami" {
  name = "/aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id"
}
