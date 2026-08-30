const Database = require("better-sqlite3");
const path = require("path");


// Database file location

const dbPath = path.join(
    __dirname,
    "../database.sqlite"
);


// Create or open database

const db = new Database(dbPath);


// Create table

db.prepare(`
    CREATE TABLE IF NOT EXISTS emails (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        recipients TEXT NOT NULL,

        cc TEXT,

        bcc TEXT,

        subject TEXT NOT NULL,

        message TEXT NOT NULL,

        scheduled_time TEXT NOT NULL,

        status TEXT DEFAULT 'scheduled',

        attachments TEXT,

        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        sent_at TEXT,

        error_message TEXT

    )
`).run();


console.log("SQLite database connected.");


module.exports = db;