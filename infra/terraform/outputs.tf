output "server_public_ip" {
  description = "Elastic IP of the server. Add this as an A record for api_subdomain in Namecheap."
  value       = aws_eip.server.public_ip
}

output "server_instance_id" {
  description = "EC2 instance ID — use with `aws ssm start-session --target <id>` to connect (no SSH)."
  value       = aws_instance.server.id
}

output "cloudfront_domain_name" {
  description = "Add this as a CNAME for app_subdomain in Namecheap."
  value       = aws_cloudfront_distribution.client.domain_name
}

output "cloudfront_distribution_id" {
  description = "Used for cache invalidation after a client redeploy."
  value       = aws_cloudfront_distribution.client.id
}

output "client_bucket_name" {
  description = "S3 bucket to sync the built client to."
  value       = aws_s3_bucket.client.bucket
}

output "github_ci_access_key_id" {
  description = "Access key ID for the GitHub Actions deploy user."
  value       = aws_iam_access_key.github_ci.id
}

output "github_ci_secret_access_key" {
  description = "Secret access key for the GitHub Actions deploy user. Feed this directly into `gh secret set`, never print it."
  value       = aws_iam_access_key.github_ci.secret
  sensitive   = true
}

output "acm_validation_record" {
  description = "DNS validation CNAME to add in Namecheap before the ACM certificate can issue."
  value = {
    name  = tolist(aws_acm_certificate.cloudfront.domain_validation_options)[0].resource_record_name
    type  = tolist(aws_acm_certificate.cloudfront.domain_validation_options)[0].resource_record_type
    value = tolist(aws_acm_certificate.cloudfront.domain_validation_options)[0].resource_record_value
  }
}
