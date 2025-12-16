output "google_client_id" {
  description = "The client ID for the OAuth 2.0 client."
  value       = google_oauth_client.obsidian_gcal_sync_client.client_id
}

output "project_id" {
    description = "The ID of the created project"
    value = google_project.obsidian_gcal_sync.project_id
}
