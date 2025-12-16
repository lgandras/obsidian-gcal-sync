variable "project_id" {
  description = "The ID of the Google Cloud project to create."
  type        = string
  default     = "obsidian-gcal-sync"
}

variable "region" {
  description = "The region to create the resources in."
  type        = string
  default     = "us-central1"
}

variable "billing_account" {
  description = "The billing account to use for the project."
  type        = string
}

variable "support_email" {
  description = "The email address to be used as support email for OAuth consent screen."
  type = string
}
