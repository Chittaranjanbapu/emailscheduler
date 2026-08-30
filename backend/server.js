require("dotenv").config();


// ==========================================
// IMPORT PACKAGES
// ==========================================

const express =
    require("express");


const cors =
    require("cors");


const multer =
    require("multer");


const path =
    require("path");


const fs =
    require("fs");


// ==========================================
// DATABASE
// ==========================================

const db =
    require(
        "./database/database"
    );


// ==========================================
// START SCHEDULER
// ==========================================

require(
    "./scheduler"
);


// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app =
    express();


// ==========================================
// PORT
// ==========================================

const PORT =
    process.env.PORT ||
    5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    cors()
);


app.use(
    express.json()
);


app.use(
    express.urlencoded({

        extended: true

    })
);


// ==========================================
// CREATE UPLOADS FOLDER
// ==========================================

const uploadsFolder =
    path.join(
        __dirname,
        "uploads"
    );


if (
    !fs.existsSync(
        uploadsFolder
    )
) {

    fs.mkdirSync(
        uploadsFolder,

        {
            recursive: true
        }

    );

}


// ==========================================
// MULTER CONFIGURATION
// ==========================================

const storage =
    multer.diskStorage({

        destination:

            function (
                request,
                file,
                callback
            ) {

                callback(
                    null,
                    uploadsFolder
                );

            },


        filename:

            function (
                request,
                file,
                callback
            ) {

                const uniqueName =

                    Date.now()

                    +

                    "-"

                    +

                    Math.round(
                        Math.random()
                        *
                        1000000000
                    )

                    +

                    path.extname(
                        file.originalname
                    );


                callback(
                    null,
                    uniqueName
                );

            }

    });


const upload =
    multer({

        storage:

            storage,


        limits: {

            fileSize:

                10
                *
                1024
                *
                1024

        }

    });


// ==========================================
// HOME ROUTE
// ==========================================

app.get(

    "/",

    (
        request,
        response
    ) => {

        response.json({

            message:

                "Email Scheduler Backend is running!"

        });

    }

);


// ==========================================
// CREATE SCHEDULED EMAIL
// ==========================================

app.post(

    "/api/emails",

    upload.array(
        "attachments",
        5
    ),

    (
        request,
        response
    ) => {

        try {

            // ------------------------------
            // GET DATA
            // ------------------------------

            const {

                recipients,

                cc,

                bcc,

                subject,

                message,

                scheduledTime

            } =
                request.body;


            // ------------------------------
            // VALIDATION
            // ------------------------------

            if (
                !recipients
            ) {

                return response
                    .status(400)
                    .json({

                        success: false,

                        message:

                            "Recipient is required."

                    });

            }


            if (
                !subject
            ) {

                return response
                    .status(400)
                    .json({

                        success: false,

                        message:

                            "Subject is required."

                    });

            }


            if (
                !message
            ) {

                return response
                    .status(400)
                    .json({

                        success: false,

                        message:

                            "Email message is required."

                    });

            }


            if (
                !scheduledTime
            ) {

                return response
                    .status(400)
                    .json({

                        success: false,

                        message:

                            "Schedule time is required."

                    });

            }


            // ------------------------------
            // VALIDATE DATE
            // ------------------------------

            const scheduleDate =

                new Date(
                    scheduledTime
                );


            if (
                isNaN(
                    scheduleDate.getTime()
                )
            ) {

                return response
                    .status(400)
                    .json({

                        success: false,

                        message:

                            "Invalid scheduled time."

                    });

            }


            // ------------------------------
            // MUST BE FUTURE
            // ------------------------------

            if (
                scheduleDate <=
                new Date()
            ) {

                return response
                    .status(400)
                    .json({

                        success: false,

                        message:

                            "Please select a future date and time."

                    });

            }


            // ------------------------------
            // HANDLE ATTACHMENTS
            // ------------------------------

            const attachments =

                request.files.map(

                    file => ({

                        originalname:

                            file.originalname,


                        filename:

                            file.filename,


                        path:

                            file.path,


                        mimetype:

                            file.mimetype


                    })

                );


            // ------------------------------
            // SAVE TO DATABASE
            // ------------------------------

            const result =

                db.prepare(`

                    INSERT INTO emails (

                        recipients,

                        cc,

                        bcc,

                        subject,

                        message,

                        scheduled_time,

                        status,

                        attachments

                    )

                    VALUES (

                        ?,

                        ?,

                        ?,

                        ?,

                        ?,

                        ?,

                        'scheduled',

                        ?

                    )

                `)
                .run(

                    recipients,

                    cc ||
                        "[]",

                    bcc ||
                        "[]",

                    subject,

                    message,

                    scheduleDate
                        .toISOString(),

                    JSON.stringify(
                        attachments
                    )

                );


            // ------------------------------
            // RESPONSE
            // ------------------------------

            response
                .status(201)
                .json({

                    success: true,

                    message:

                        "Email scheduled successfully!",


                    emailId:

                        result.lastInsertRowid

                });

        }

        catch (
            error
        ) {

            console.error(
                error
            );


            response
                .status(500)
                .json({

                    success: false,

                    message:

                        "Something went wrong."

                });

        }

    }

);


// ==========================================
// GET ALL EMAILS
// ==========================================

app.get(

    "/api/emails",

    (
        request,
        response
    ) => {

        try {

            const emails =

                db.prepare(`

                    SELECT *

                    FROM emails

                    ORDER BY

                    scheduled_time

                    DESC

                `)
                .all();


            response.json({

                success: true,

                emails

            });

        }

        catch (
            error
        ) {

            response
                .status(500)
                .json({

                    success: false,

                    message:

                        "Unable to get emails."

                });

        }

    }

);


// ==========================================
// GET SINGLE EMAIL
// ==========================================

app.get(

    "/api/emails/:id",

    (
        request,
        response
    ) => {

        try {

            const email =

                db.prepare(`

                    SELECT *

                    FROM emails

                    WHERE id = ?

                `)
                .get(

                    request.params.id

                );


            if (
                !email
            ) {

                return response
                    .status(404)
                    .json({

                        success: false,

                        message:

                            "Email not found."

                    });

            }


            response.json({

                success: true,

                email

            });

        }

        catch (
            error
        ) {

            response
                .status(500)
                .json({

                    success: false,

                    message:

                        "Unable to get email."

                });

        }

    }

);


// ==========================================
// CANCEL EMAIL
// ==========================================

app.patch(

    "/api/emails/:id/cancel",

    (
        request,
        response
    ) => {

        try {

            const email =

                db.prepare(`

                    SELECT *

                    FROM emails

                    WHERE id = ?

                `)
                .get(

                    request.params.id

                );


            if (
                !email
            ) {

                return response
                    .status(404)
                    .json({

                        success: false,

                        message:

                            "Email not found."

                    });

            }


            // Cannot cancel sent email

            if (
                email.status ===
                "sent"
            ) {

                return response
                    .status(400)
                    .json({

                        success: false,

                        message:

                            "Sent email cannot be cancelled."

                    });

            }


            // Update

            db.prepare(`

                UPDATE emails

                SET status = 'cancelled'

                WHERE id = ?

            `)
            .run(

                request.params.id

            );


            response.json({

                success: true,

                message:

                    "Email cancelled successfully."

            });

        }

        catch (
            error
        ) {

            response
                .status(500)
                .json({

                    success: false,

                    message:

                        "Unable to cancel email."

                });

        }

    }

);


// ==========================================
// DELETE EMAIL
// ==========================================

app.delete(

    "/api/emails/:id",

    (
        request,
        response
    ) => {

        try {

            const result =

                db.prepare(`

                    DELETE FROM emails

                    WHERE id = ?

                `)
                .run(

                    request.params.id

                );


            if (
                result.changes === 0
            ) {

                return response
                    .status(404)
                    .json({

                        success: false,

                        message:

                            "Email not found."

                    });

            }


            response.json({

                success: true,

                message:

                    "Email deleted successfully."

            });

        }

        catch (
            error
        ) {

            response
                .status(500)
                .json({

                    success: false,

                    message:

                        "Unable to delete email."

                });

        }

    }

);


// ==========================================
// UPDATE EMAIL
// ==========================================

app.put(

    "/api/emails/:id",

    upload.array(
        "attachments",
        5
    ),

    (
        request,
        response
    ) => {

        try {

            const email =

                db.prepare(`

                    SELECT *

                    FROM emails

                    WHERE id = ?

                `)
                .get(

                    request.params.id

                );


            if (
                !email
            ) {

                return response
                    .status(404)
                    .json({

                        success: false,

                        message:

                            "Email not found."

                    });

            }


            // Sent emails cannot be edited

            if (
                email.status ===
                "sent"
            ) {

                return response
                    .status(400)
                    .json({

                        success: false,

                        message:

                            "Sent email cannot be edited."

                    });

            }


            const {

                recipients,

                cc,

                bcc,

                subject,

                message,

                scheduledTime

            } =
                request.body;


            // New attachments

            const newAttachments =

                request.files.map(

                    file => ({

                        originalname:

                            file.originalname,


                        filename:

                            file.filename,


                        path:

                            file.path,


                        mimetype:

                            file.mimetype

                    })

                );


            // Old attachments

            let oldAttachments = [];


            if (
                email.attachments
            ) {

                oldAttachments =

                    JSON.parse(
                        email.attachments
                    );

            }


            // Combine

            const attachments = [

                ...oldAttachments,

                ...newAttachments

            ];


            // Convert scheduled time

            let finalScheduledTime =

                email.scheduled_time;


            if (
                scheduledTime
            ) {

                const date =

                    new Date(
                        scheduledTime
                    );


                if (
                    isNaN(
                        date.getTime()
                    )
                ) {

                    return response
                        .status(400)
                        .json({

                            success: false,

                            message:

                                "Invalid date."

                        });

                }


                finalScheduledTime =

                    date.toISOString();

            }


            // Update database

            db.prepare(`

                UPDATE emails

                SET

                    recipients = ?,

                    cc = ?,

                    bcc = ?,

                    subject = ?,

                    message = ?,

                    scheduled_time = ?,

                    attachments = ?,

                    status = 'scheduled',

                    error_message = NULL

                WHERE id = ?

            `)
            .run(

                recipients ||
                    email.recipients,

                cc ||
                    email.cc,

                bcc ||
                    email.bcc,

                subject ||
                    email.subject,

                message ||
                    email.message,

                finalScheduledTime,

                JSON.stringify(
                    attachments
                ),

                request.params.id

            );


            response.json({

                success: true,

                message:

                    "Email updated successfully."

            });

        }

        catch (
            error
        ) {

            console.error(
                error
            );


            response
                .status(500)
                .json({

                    success: false,

                    message:

                        "Unable to update email."

                });

        }

    }

);


// ==========================================
// START SERVER
// ==========================================

app.listen(

    PORT,

    () => {

        console.log(

            `Server running on:
             http://localhost:${PORT}`

        );

    }

);