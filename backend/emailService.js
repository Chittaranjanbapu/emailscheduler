require("dotenv").config();

const nodemailer = require("nodemailer");

// Gmail SMTP IPv4 address
// Resolved from smtp.gmail.com
const transporter = nodemailer.createTransport({
    host: "192.178.211.108",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },

    // Keep Gmail's hostname for TLS certificate verification
    tls: {
        servername: "smtp.gmail.com"
    },

    connectionTimeout: 120000,
    greetingTimeout: 30000,
    socketTimeout: 120000
});

// Test SMTP connection when the server starts
transporter.verify()
    .then(() => {
        console.log("Gmail SMTP connection verified successfully.");
    })
    .catch((error) => {
        console.error(
            "Gmail SMTP verification failed:",
            error.message
        );
    });


async function sendEmail(email) {
    try {
        const recipients = JSON.parse(email.recipients);

        const cc = email.cc ? JSON.parse(email.cc) : [];
        const bcc = email.bcc ? JSON.parse(email.bcc) : [];

        let attachments = [];

        if (email.attachments) {
            const savedAttachments = JSON.parse(email.attachments);

            attachments = savedAttachments.map(file => ({
                filename: file.originalname,
                path: file.path
            }));
        }

        const result = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipients.join(","),
            cc: cc.length > 0 ? cc.join(",") : undefined,
            bcc: bcc.length > 0 ? bcc.join(",") : undefined,
            subject: email.subject,
            html: email.message,
            attachments: attachments
        });

        console.log(
            "Email sent successfully:",
            result.messageId
        );

        return {
            success: true,
            messageId: result.messageId
        };

    } catch (error) {
        console.error(
            "Email sending error:",
            error.message
        );

        return {
            success: false,
            error: error.message
        };
    }
}


module.exports = {
    sendEmail
};