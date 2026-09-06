require("dotenv").config();

const nodemailer = require("nodemailer");


// Create email transporter

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 465,

    secure: true,

    family: 4,

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASSWORD

    }

});


async function sendEmail(email) {

    try {

        // Convert recipients back from JSON

        const recipients =
            JSON.parse(email.recipients);


        const cc =
            email.cc
                ? JSON.parse(email.cc)
                : [];


        const bcc =
            email.bcc
                ? JSON.parse(email.bcc)
                : [];


        // Convert attachments

        let attachments = [];


        if (email.attachments) {

            const savedAttachments =
                JSON.parse(email.attachments);


            attachments =
                savedAttachments.map(file => ({

                    filename: file.originalname,

                    path: file.path

                }));

        }


        // Send email

        const result =
            await transporter.sendMail({

                from: process.env.EMAIL_USER,

                to: recipients.join(","),

                cc:
                    cc.length > 0
                        ? cc.join(",")
                        : undefined,

                bcc:
                    bcc.length > 0
                        ? bcc.join(",")
                        : undefined,

                subject: email.subject,

                html: email.message,

                attachments: attachments

            });


        console.log(
            "Email sent:",
            result.messageId
        );


        return {

            success: true,

            messageId:
                result.messageId

        };

    }

    catch (error) {

        console.error(
            "Email sending error:",
            error.message
        );


        return {

            success: false,

            error:
                error.message

        };

    }

}


module.exports = {

    sendEmail

};