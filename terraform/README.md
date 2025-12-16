# Terraform for Obsidian GCal Sync

This Terraform script automates the setup of the required Google Cloud infrastructure for the Obsidian GCal Sync plugin.

## Prerequisites

- [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli) installed
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and authenticated
- A Google Cloud billing account

## What it does

This script will:

1.  Create a new Google Cloud project.
2.  Enable the Google Calendar API in that project.
3.  Create an OAuth 2.0 consent screen.
4.  Create an OAuth 2.0 Client ID for a web application.
5.  Output the Client ID to be used in your `.env` file.

## How to use

1.  **Navigate to the terraform directory:**

    ```bash
    cd obsidian-gcal-sync/terraform
    ```

2.  **Create a `terraform.tfvars` file:**

    Create a file named `terraform.tfvars` and add the following content, replacing the placeholder values with your own:

    ```hcl
    billing_account = "YOUR_BILLING_ACCOUNT_ID"
    support_email   = "YOUR_EMAIL_ADDRESS"
    ```

    - `YOUR_BILLING_ACCOUNT_ID`: You can find your billing account ID by running `gcloud beta billing accounts list`.
    - `YOUR_EMAIL_ADDRESS`: This will be the email address displayed on the OAuth consent screen.

3.  **Initialize Terraform:**

    ```bash
    terraform init
    ```

4.  **Apply the configuration:**

    ```bash
    terraform apply
    ```

    Terraform will show you a plan and ask for confirmation. Type `yes` to proceed.

5.  **Get the Client ID:**

    After the script finishes, it will output the `google_client_id`. Copy this value.

6.  **Update your `.env` file:**

    In the root of the `obsidian-gcal-sync` project, rename `.env.template` to `.env` and paste the copied Client ID:

    ```
    GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_FROM_TERRAFORM
    ```

## Cleanup

To remove all the resources created by this script, run:

```bash
terraform destroy
```
