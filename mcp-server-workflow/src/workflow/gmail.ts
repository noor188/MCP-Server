import path from 'path';
import { authenticate } from '@google-cloud/local-auth';
import { google, gmail_v1 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];

async function getAuth() {
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    return authenticate({
        keyfilePath: credentialsPath,
        scopes: SCOPES,
    });
}

// Send an email
export async function sendEmail(to: string, subject: string, message: string) {
    const auth = await getAuth();
    const gmail = google.gmail({ version: 'v1', auth });

    const emailLines = [
        `To: ${to}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        message,
    ];
    const email = emailLines.join('\n');

    const encodedMessage = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: encodedMessage,
        },
    });
}

// List the latest emails
export async function listEmails(maxResults = 5): Promise<gmail_v1.Schema$Message[]> {
    const auth = await getAuth();
    const gmail = google.gmail({ version: 'v1', auth });

    const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults,
    });
    return res.data.messages || [];
}