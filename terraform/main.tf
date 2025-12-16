terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "random_id" "project_suffix" {
  byte_length = 4
}

resource "google_project" "obsidian_gcal_sync" {
  name            = var.project_id
  project_id      = "${var.project_id}-${random_id.project_suffix.hex}"
  billing_account = var.billing_account
  labels = {
    "created-by" = "terraform"
  }
}

resource "google_project_service" "calendar_api" {
  project = google_project.obsidian_gcal_sync.project_id
  service = "calendar-json.googleapis.com"

  // Don't disable the service on terraform destroy
  disable_on_destroy = false
}

resource "google_oauth_brand" "obsidian_gcal_sync_brand" {
  project_number    = google_project.obsidian_gcal_sync.number
  support_email     = var.support_email
  application_title = "Obsidian GCal Sync"
}

resource "google_oauth_client" "obsidian_gcal_sync_client" {
  project       = google_project.obsidian_gcal_sync.project_id
  brand         = google_oauth_brand.obsidian_gcal_sync_brand.name
  name          = "obsidian-gcal-sync-client"
  redirect_uris = [
    "http://localhost:8085",
    "https://obsidian-gcal-sync.netlify.app/.netlify/functions/auth"
  ]
}
