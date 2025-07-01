import path from 'path';
import fs from 'fs-extra';
import { authenticate } from '@google-cloud/local-auth';
import { google, calendar_v3 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(process.cwd(), 'toke.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function getAuth() {
    // If token exists, use it
    if (await fs.pathExists(TOKEN_PATH)) {
        const token = await fs.readJson(TOKEN_PATH);
        const credentials = await fs.readJson(CREDENTIALS_PATH);
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    }

    // Otherwise, authenticate and save token
    const oAuth2Client = await authenticate({
        keyfilePath: CREDENTIALS_PATH,
        scopes: SCOPES,
    });
    // Save the token for next time
    await fs.writeJson(TOKEN_PATH, oAuth2Client.credentials, { spaces: 2 });
    return oAuth2Client;
}


export async function listUpcomingEvents(maxResults = 10): Promise<calendar_v3.Schema$Event[]> {
    const auth = await getAuth();
    const calendar = google.calendar({ version: 'v3', auth: auth as any });
    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
    });
    return res.data.items || [];
}

export async function createEvent(event: calendar_v3.Schema$Event) {
    const auth = await getAuth();
    const calendar = google.calendar({ version: 'v3', auth: auth as any });
    const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
    });
    return res.data;
}