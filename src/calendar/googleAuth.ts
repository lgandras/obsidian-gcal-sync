import { OAuth2Client, Credentials } from 'google-auth-library';
import { google } from 'googleapis';
import { Notice, Platform, ObsidianProtocolData } from 'obsidian';
import GoogleCalendarSyncPlugin from '../core/main';
import { OAuth2Tokens } from '../core/types';
import { LogUtils } from '../utils/logUtils';
import { openWith } from '../utils/fsUtils';

export class GoogleAuthManager {
    private plugin: GoogleCalendarSyncPlugin;
    private auth: OAuth2Client;

    constructor(plugin: GoogleCalendarSyncPlugin) {
        this.plugin = plugin;
        this.auth = this.createOAuth2Client();
    }

    private createOAuth2Client(): OAuth2Client {
        const { clientId, clientSecret } = this.plugin.settings;
        const redirectUri = 'http://127.0.0.1:42813/auth/gcalsync';
        return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
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
        const authUrl = this.auth.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: ['https://www.googleapis.com/auth/calendar'],
        });

        openWith(authUrl);
    }

    public async handleProtocolCallback(params: ObsidianProtocolData): Promise<void> {
        const code = params.code;
        if (!code) {
            throw new Error('Missing authorization code in callback parameters');
        }
        try {
            const { tokens } = await this.auth.getToken(code);
            this.auth.setCredentials(tokens);
            this.plugin.settings.oauth2Tokens = this.credentialsToOAuth2Tokens(tokens);
            await this.plugin.saveSettings();
        } catch (error) {
            LogUtils.error('Failed to handle protocol callback:', error);
            throw error;
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