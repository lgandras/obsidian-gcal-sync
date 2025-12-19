#!/bin/bash
set -e
(cd terraform && terraform output -json | jq '{
  installed: {
    client_id: .client_id.value,
    project_id: .project_id.value,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: .client_secret.value,
    redirect_uris: [
      "http://localhost"
    ]
  }
}' > ../poc/credentials.json)
