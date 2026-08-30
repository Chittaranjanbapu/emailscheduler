const cron = require("node-cron");

const db = require(
    "./database/database"
);

const {
    sendEmail
} = require(
    "./emailService"
);


// ==========================================
// PROCESS SCHEDULED EMAILS
// ==========================================

async function checkScheduledEmails() {

    try {

        const currentTime =
            new Date()
                .toISOString();


        // Get all emails that should be sent

        const emails =
            db.prepare(`

                SELECT *

                FROM emails

                WHERE status = 'scheduled'

                AND scheduled_time <= ?

            `)
            .all(
                currentTime
            );


        // If no emails

        if (
            emails.length === 0
        ) {

            return;

        }


        console.log(

            `Found ${emails.length} email(s) to send.`

        );


        // Process emails

        for (
            const email of emails
        ) {

            // ==================================
            // MARK AS SENDING
            // ==================================

            db.prepare(`

                UPDATE emails

                SET status = 'sending'

                WHERE id = ?

            `)
            .run(
                email.id
            );


            console.log(

                `Sending email ID: ${email.id}`

            );


            // ==================================
            // SEND EMAIL
            // ==================================

            const result =
                await sendEmail(
                    email
                );


            // ==================================
            // SUCCESS
            // ==================================

            if (
                result.success
            ) {

                db.prepare(`

                    UPDATE emails

                    SET
                        status = 'sent',

                        sent_at = ?

                    WHERE id = ?

                `)
                .run(

                    new Date()
                        .toISOString(),

                    email.id

                );


                console.log(

                    `Email ${email.id} sent successfully.`

                );

            }


            // ==================================
            // FAILED
            // ==================================

            else {

                db.prepare(`

                    UPDATE emails

                    SET
                        status = 'failed',

                        error_message = ?

                    WHERE id = ?

                `)
                .run(

                    result.error,

                    email.id

                );


                console.log(

                    `Email ${email.id} failed.`

                );

            }

        }

    }

    catch (error) {

        console.error(

            "Scheduler error:",

            error

        );

    }

}


// ==========================================
// RUN EVERY MINUTE
// ==========================================

cron.schedule(

    "* * * * *",

    async () => {

        console.log(
            "Checking scheduled emails..."
        );


        await checkScheduledEmails();

    }

);


// ==========================================
// CHECK ON SERVER START
// ==========================================

checkScheduledEmails();


console.log(
    "Email scheduler started."
);