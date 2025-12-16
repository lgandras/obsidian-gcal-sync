#!/bin/bash

# Exit script on error
set -e

# --- Billing Account Selection ---
echo "Fetching Billing Accounts..."
# Use a temporary file to store billing data
billing_list_file=$(mktemp)
gcloud billing accounts list --format="csv(displayName,name)" | tail -n +2 > "$billing_list_file"

if [ ! -s "$billing_list_file" ]; then
    echo "No billing accounts found or you may not have permission to list them."
    rm "$billing_list_file"
    exit 1
fi

echo "Please select a billing account:"
PS3="Enter the number for the billing account: "
select billing_choice in $(cut -d, -f1 "$billing_list_file"); do
    if [[ -n "$billing_choice" ]]; then
        billing_id=$(grep "^$billing_choice," "$billing_list_file" | cut -d, -f2)
        break
    else
        echo "Invalid selection. Please try again."
    fi
done
rm "$billing_list_file"

billing_id_only=$(basename "$billing_id")

echo "You selected billing account: $billing_choice ($billing_id_only)"

# --- Update Terraform Variables ---
TF_VARS_FILE="terraform/terraform.tfvars"
echo "Updating Terraform variables in $TF_VARS_FILE..."

# Create the terraform directory if it doesn't exist
mkdir -p terraform

# Write the billing account to the terraform.tfvars file
echo "billing_account = \"$billing_id_only\"" > "$TF_VARS_FILE"

echo "Terraform variables updated successfully!"
echo "You can now run 'terraform apply' in the 'terraform' directory."
