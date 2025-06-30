import sqlite3 from 'sqlite3';
import path from 'path';
import os from 'os';

// setup 
// 1. path to chrome History DB
const historyPath = path.join(
    os.homedir(),
    'AppData',
    'Local',
    'Google',
    'Chrome',
    'User Data',
    'Default',
    'History'
);

// 2. Open the database (read-only)
const db = new sqlite3.Database(historyPath, sqlite3.OPEN_READONLY, (err) => {
    if (err){
        console.error("Error opening database", err.message);
    } else {
        console.log("Database opened successfully");
    }
});

// workflow
// Query last 10 visited URLs
export function getRecentHistory(limit = 10): Promise<any[]>{
    return new Promise ((resolve, reject) => {
        db.all(
            `SELECT url, title, last_visit_time
            FROM urls
            ORDER BY last_visit_time DESC
            LIMIT ?`,
            [limit],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
                }           
        );
    });
}