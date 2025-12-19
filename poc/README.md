# Google Calendar API Proof of Concept

This is a proof of concept to demonstrate how to authenticate with the Google Calendar API using OAuth 2.0 and make a simple API call.

## Setup

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Enable the Google Calendar API:**

    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Create a new project.
    - Go to **APIs & Services > Library**.
    - Search for "Google Calendar API" and enable it.

3.  **Create OAuth 2.0 Credentials:**

    - Go to **APIs & Services > Credentials**.
    - Click **Create Credentials > OAuth client ID**.
    - Select **Desktop app** as the application type.
    - Give it a name (e.g., "gcal-poc").
    - Click **Create**.
    - Click **Download JSON** to download the client secret file.
    - Rename the downloaded file to `credentials.json` and place it in this `poc` directory.

## Running the PoC

Once you have `credentials.json` in the same directory, you can run the script:

```bash
npx ts-node index.ts
```

The first time you run it, you will be prompted to log in to your Google account and grant access to the application. After that, a `token.json` file will be created, storing your refresh token. Subsequent runs will use the stored token.

The script will then list the first 10 calendars in your Google Calendar account.
