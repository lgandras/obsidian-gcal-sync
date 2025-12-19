import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google, Auth } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const tokenContent = await fs.readFile(TOKEN_PATH);
    const token = JSON.parse(tokenContent.toString());

    const credsContent = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(credsContent.toString());
    const key = keys.installed || keys.web;

    const client = new google.auth.OAuth2(key.client_id, key.client_secret, key.redirect_uris[0]);
    client.setCredentials(token);
    return client;
  } catch (err) {
    console.log(err);
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client: OAuth2Client): Promise<void> {
  const payload = JSON.stringify(client.credentials);
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize(): Promise<OAuth2Client | null> {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the user's calendars.
 *
 * @param {OAuth2Client} auth An authorized OAuth2 client.
 */
async function listCalendars(auth: OAuth2Client) {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.calendarList.list({
    maxResults: 10,
  });
  const calendars = res.data.items;
  if (!calendars || calendars.length === 0) {
    console.log('No calendars found.');
    return;
  }
  console.log('Calendars:');
  calendars.map((calendar) => {
    console.log(`- ${calendar.summary} (${calendar.id})`);
  });
}

authorize().then(client => {
    if (client) {
        listCalendars(client);
    }
}).catch(console.error);
