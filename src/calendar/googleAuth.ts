import { OAuth2Client, Credentials } from 'google-auth-library';
import { google } from 'googleapis';
import { Notice, Platform } from 'obsidian';
import GoogleCalendarSyncPlugin from '../core/main';
import { OAuth2Tokens } from '../core/types';
import { LogUtils } from '../utils/logUtils';
import { authenticate } from '@google-cloud/local-auth';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

export class GoogleAuthManager {
    private plugin: GoogleCalendarSyncPlugin;
    private auth: OAuth2Client;

    constructor(plugin: GoogleCalendarSyncPlugin) {
        this.plugin = plugin;
        this.auth = new google.auth.OAuth2();
    }

    private credentialsToOAuth2Tokens(credentials: Credentials): OAuth2Tokens {
        return {
            access_token: credentials.access_token || '',
            refresh_token: credentials.refresh_token || undefined,
            scope: credentials.scope || '',
            token_type: credentials.token_type || '',
            expiry_date: credentials.expiry_date || 0,
        };
    }

    public getOAuth2Client(): OAuth2Client {
        return this.auth;
    }

    public async loadSavedTokens(): Promise<void> {
        if (this.plugin.settings.oauth2Tokens) {
            this.auth.setCredentials(this.plugin.settings.oauth2Tokens);
        }
    }

    public isAuthenticated(): boolean {
        return !!this.plugin.settings.oauth2Tokens?.access_token;
    }

    public async getValidAccessToken(): Promise<string | null | undefined> {
        if (!this.isAuthenticated()) {
            return null;
        }

        const expiryDate = this.auth.credentials.expiry_date || 0;
        if (expiryDate < Date.now() + 60 * 1000) {
            try {
                const { credentials } = await this.auth.refreshAccessToken();
                this.plugin.settings.oauth2Tokens = this.credentialsToOAuth2Tokens(credentials);
                await this.plugin.saveSettings();
            } catch (error) {
                LogUtils.error('Failed to refresh access token:', error);
                this.plugin.settings.oauth2Tokens = undefined;
                await this.plugin.saveSettings();
                return null;
            }
        }
        return this.auth.credentials.access_token;
    }

    public async authorize(): Promise<void> {
        
        const credentialsPath = path.join(os.homedir(), '.config', 'obsidian-gcal-sync', 'credentials.json');

        try {
            await fs.mkdir(path.dirname(credentialsPath), { recursive: true });
            await fs.writeFile(credentialsPath, JSON.stringify({
                "installed": {
                    "client_id": this.plugin.settings.clientId,
                    "project_id": "obsidian-gcal-sync",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_secret": this.plugin.settings.clientSecret,
                    "redirect_uris": [
                        "http://localhost:42813/auth/gcalsync"
                    ]
                }
            }));
        } catch(err) {
            LogUtils.error('Failed to write credentials file:', err);
            new Notice('Failed to write credentials file required for authentication.');
            return;
        }

        try {
            const client = await authenticate({
                scopes: ['https://www.googleapis.com/auth/calendar'],
                keyfilePath: credentialsPath,
            });

            if (client.credentials) {
                this.auth.setCredentials(client.credentials);
                this.plugin.settings.oauth2Tokens = this.credentialsToOAuth2Tokens(client.credentials);
                await this.plugin.saveSettings();
                new Notice('Successfully authenticated with Google Calendar!');
            } else {
                new Notice('Authentication failed. Please try again.');
            }
        } catch (error) {
            LogUtils.error('Failed to authenticate:', error);
            new Notice('Authentication failed. Check the console for more details.');
        } finally {
            try {
                await fs.unlink(credentialsPath);
            } catch (err) {
                LogUtils.error('Failed to delete credentials file:', err);
            }
        }
    }

    public async revokeAccess(): Promise<void> {
        if (this.isAuthenticated()) {
            try {
                await this.auth.revokeCredentials();
            } catch (error) {
                LogUtils.error('Failed to revoke credentials:', error);
            }
        }
        this.plugin.settings.oauth2Tokens = undefined;
        await this.plugin.saveSettings();
    }

    public async cleanup(): Promise<void> {
        // Nothing to do
    }

    public async onunload(): Promise<void> {
        // Nothing to do here for this implementation
    }
}