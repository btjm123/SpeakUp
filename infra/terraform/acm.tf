# CloudFront certificates must live in us-east-1. DNS is on Namecheap (not Route53), so
# validation is manual: `terraform apply` creates the cert request, then run
# `terraform output acm_validation_record` and add that CNAME in Namecheap, then apply again.

resource "aws_acm_certificate" "cloudfront" {
  provider          = aws.us_east_1
  domain_name       = var.app_subdomain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cloudfront" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.cloudfront.arn
}
