const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Load and parse service account credentials from .env file
try {
    // Load and parse service account credentials from .env file
    const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
    const calendarId = process.env.CALENDAR_ID;

    const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
    const calendar = google.calendar({ version: 'v3' });

    const auth = new google.auth.JWT(
        CREDENTIALS.client_email,
        null,
        CREDENTIALS.private_key,
        SCOPES
    );

    const getEvents = async (dateTimeStart, dateTimeEnd) => {
        try {
            let response = await calendar.events.list({
                auth: auth,
                calendarId: calendarId,
                timeMin: dateTimeStart.toISOString(),
                timeMax: dateTimeEnd.toISOString(),
                singleEvents: true,
                timeZone: 'America/Los_Angeles'
            });

            let items = response['data']['items'];
            return items;
        } catch (error) {
            console.log(`Error at getEvents --> ${error}`);
            return [];
        }
    };

    app.get('/events/:startDay/:endDay', async (req, res) => {
        let start, end;
        try {
            start = new Date(req.params.startDay);
            start.setHours(0, 0, 0, 0);
            end = new Date(req.params.endDay);
            end.setHours(23, 59, 59, 999);
        } catch (err) {
            console.error(err);
            res.status(400).send({ error: 'Bad start or end day' });
            return;
        }
        let results;
        try {
            results = await getEvents(start, end);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'An internal error occurred' });
            return;
        }
        res.send(results);
    });

    app.listen(8080, () => console.log('Server running on http://localhost:8080'));
} catch (err) {
    console.error('Error parsing CREDENTIALS:', err);
}