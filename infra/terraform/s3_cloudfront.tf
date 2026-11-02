resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "client" {
  bucket = "${var.project_name}-client-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket_public_access_block" "client" {
  bucket                  = aws_s3_bucket.client.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "client" {
  name                              = "${var.project_name}-client"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "client" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = [var.app_subdomain]
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.client.bucket_regional_domain_name
    origin_id                = "client-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.client.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "client-s3"
    viewer_protocol_policy = "redirect-to-https"
    compress                = true
    cache_policy_id         = "658327ea-f89d-4fab-a63d-7e88639e58f6" # AWS managed: CachingOptimized
  }

  # React Router (client-side routing): serve index.html for paths S3 doesn't have.
  custom_error_response {
    error_code         = 403
    response_code       = 200
    response_page_path  = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code       = 200
    response_page_path  = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cloudfront.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_s3_bucket_policy" "client" {
  bucket = aws_s3_bucket.client.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontServicePrincipal"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.client.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.client.arn
        }
      }
    }]
  })
}
