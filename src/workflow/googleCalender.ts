import path from 'path';
import { authenticate } from '@google-cloud/local-auth';
import { google, calendar_v3 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function getAuth() {
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    // authenticate() returns an OAuth2Client directly
    return authenticate({
        keyfilePath: credentialsPath,
        scopes: SCOPES,
    });
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