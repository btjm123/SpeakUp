variable "aws_region" {
  description = "AWS region for the server (EC2) and default resources."
  type        = string
  default     = "ap-southeast-2"
}

variable "aws_profile" {
  description = "AWS CLI profile to use (set up via `aws login`)."
  type        = string
  default     = "speakup"
}

variable "project_name" {
  description = "Short name used to tag/prefix resources."
  type        = string
  default     = "speakup"
}

variable "root_domain" {
  description = "Root domain registered on Namecheap."
  type        = string
  default     = "benntan.com"
}

variable "app_subdomain" {
  description = "Subdomain the client (CloudFront) will be served on."
  type        = string
  default     = "speakup.benntan.com"
}

variable "api_subdomain" {
  description = "Subdomain the server (EC2) will be served on."
  type        = string
  default     = "api.speakup.benntan.com"
}

variable "instance_type" {
  description = "EC2 instance type for the server. t3.micro is Free Tier eligible for 12 months on a new account."
  type        = string
  default     = "t3.micro"
}

variable "github_repo_url" {
  description = "Public GitHub repo URL the EC2 instance clones at boot."
  type        = string
  default     = "https://github.com/btjm123/SpeakUp.git"
}

variable "github_branch" {
  description = "Branch to deploy."
  type        = string
  default     = "main"
}
