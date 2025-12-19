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

resource "random_id" "obsidian_project_suffix" {
  byte_length = 4
}

resource "google_project" "obsidian_gcal_sync" {
  name            = var.project_id
  project_id      = "${var.project_id}-${random_id.obsidian_project_suffix.hex}"
  #billing_account = var.billing_account
  labels = {
    "created-by" = "terraform"
  }
}

resource "google_project_service" "iap" {
  project = google_project.obsidian_gcal_sync.project_id
  service = "iap.googleapis.com"
}

resource "google_project_service" "calendar_json" {
  project = google_project.obsidian_gcal_sync.project_id
  service = "calendar-json.googleapis.com"
}

# TODO: open browser to this url: https://console.cloud.google.com/auth/clients?project=obsidian-gcal-sync-df95efa5
