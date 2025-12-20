import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google, Auth } from 'googleapis';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { GoogleAuthManagerInterface } from '../src/core/types';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

export class GoogleAuthManager implements GoogleAuthManagerInterface {
    private client: OAuth2Client | null = null;

    constructor() {
        this.loadSavedCredentialsIfExist().then(client => {
            this.client = client;
        });
    }

    private async loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
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
            console.log(`Token file not found or not valid: ${err}`);
            return null;
        }
    }

    private async saveCredentials(client: OAuth2Client): Promise<void> {
        const payload = JSON.stringify(client.credentials);
        await fs.writeFile(TOKEN_PATH, payload);
    }

    getOAuth2Client(): OAuth2Client {
        if (!this.client) {
            throw new Error("OAuth2Client not initialized.");
        }
        return this.client;
    }

    async startAuthFlow(): Promise<void> {
        this.client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        if (this.client.credentials) {
            await this.saveCredentials(this.client);
        }
    }

    async refreshTokens(tokens: Credentials): Promise<Credentials> {
        if (!this.client) {
            throw new Error("OAuth2Client not initialized.");
        }
        this.client.setCredentials(tokens);
        const refreshedTokens = await this.client.refreshAccessToken();
        if (refreshedTokens.credentials) {
            await this.saveCredentials(this.client);
            return refreshedTokens.credentials;
        }
        throw new Error("Failed to refresh tokens.");
    }

    async revokeTokens(tokens: Credentials): Promise<void> {
        if (!this.client) {
            throw new Error("OAuth2Client not initialized.");
        }
        await this.client.revokeCredentials();
        try {
            await fs.unlink(TOKEN_PATH);
        } catch (err) {
            console.error("Error deleting token file:", err);
        }
    }

    async onunload(): Promise<void> {
        // Nothing to do here for this implementation
    }
}

export default GoogleAuthManager;