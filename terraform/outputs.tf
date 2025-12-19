output "client_id" {
  description = "The client ID for the OAuth 2.0 client."
  value       = google_iap_client.obsidian_gcal_sync.client_id
}

output "client_secret" {
  description = "The client ID for the OAuth 2.0 client."
  value       = google_iap_client.obsidian_gcal_sync.secret
  sensitive   = true
}

output "project_id" {
    description = "The ID of the created project"
    value = google_project.obsidian_gcal_sync.project_id
}
