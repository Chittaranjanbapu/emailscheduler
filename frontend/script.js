/* =========================================
   ASHVAD MAIL - COMPLETE JAVASCRIPT
========================================= */

const API_URL = "https://ashvadmail.onrender.com/api";

/* =========================================
   ELEMENTS
========================================= */

const recipientInput = document.getElementById("recipientInput");
const recipientBox = document.getElementById("recipientBox");
const recipientChips = document.getElementById("recipientChips");

const toggleCc = document.getElementById("toggleCc");
const toggleBcc = document.getElementById("toggleBcc");

const ccSection = document.getElementById("ccSection");
const bccSection = document.getElementById("bccSection");

const ccInput = document.getElementById("ccInput");
const ccChips = document.getElementById("ccChips");

const bccInput = document.getElementById("bccInput");
const bccChips = document.getElementById("bccChips");

const subjectInput = document.getElementById("subjectInput");
const messageEditor = document.getElementById("messageEditor");

const scheduleDate = document.getElementById("scheduleDate");
const scheduleTime = document.getElementById("scheduleTime");
const timezone = document.getElementById("timezone");
const scheduleConfirmation = document.getElementById("scheduleConfirmation");

const previewButton = document.getElementById("previewButton");
const previewModal = document.getElementById("previewModal");
const closePreview = document.getElementById("closePreview");
const editButton = document.getElementById("editButton");
const confirmScheduleButton = document.getElementById("confirmScheduleButton");
const previewBody = document.getElementById("previewBody");
const scheduleButton = document.getElementById("scheduleButton");

const attachmentInput = document.getElementById("attachmentInput");
const attachmentList = document.getElementById("attachmentList");

const scheduledNav = document.getElementById("scheduledNav");
const scheduledView = document.getElementById("scheduledView");
const composeView = document.getElementById("composeView");

const backButton = document.getElementById("backButton");
const scheduledList = document.getElementById("scheduledList");
const emptyState = document.getElementById("emptyState");
const scheduledCount = document.getElementById("scheduledCount");
const createEmailButton = document.getElementById("createEmailButton");

const totalSentCount = document.getElementById("totalSentCount");
const deliveredCount = document.getElementById("deliveredCount");
const undeliveredCount = document.getElementById("undeliveredCount");

const emailSearch = document.getElementById("emailSearch");
const filterButton = document.getElementById("filterButton");
const filterLabel = document.getElementById("filterLabel");

const sortDateButton = document.getElementById("sortDateButton");
const sortArrow = document.getElementById("sortArrow");

const tableInfo = document.getElementById("tableInfo");

const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const pageNumbers = document.getElementById("pageNumbers");


/* =========================================
   DATA
========================================= */

let recipients = [];
let ccRecipients = [];
let bccRecipients = [];

let selectedFiles = [];
let scheduledEmails = [];

let currentPage = 1;
const rowsPerPage = 5;

let currentFilter = "all";
let dateSortDirection = "desc";


/* =========================================
   GENERAL HELPERS
========================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    const div = document.createElement("div");

    div.textContent = String(value);

    return div.innerHTML;
}


function stripHTML(value) {

    const div = document.createElement("div");

    div.innerHTML = value || "";

    return (
        div.textContent ||
        div.innerText ||
        ""
    ).trim();
}


function parseEmailList(value) {

    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (typeof value === "string") {

        try {

            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                return parsed.filter(Boolean);
            }

        } catch (error) {

            /* Normal string */

        }

        return value
            .split(",")
            .map(email => email.trim())
            .filter(Boolean);
    }

    return [];
}


function isValidEmail(email) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);
}


function getEmailDate(email) {

    const raw =
        email.scheduled_time ||
        email.scheduledTime ||
        email.sent_at ||
        email.sentAt ||
        (
            email.date &&
            email.time
                ? `${email.date}T${email.time}`
                : null
        );

    if (!raw) {
        return null;
    }

    const date = new Date(raw);

    return Number.isNaN(date.getTime())
        ? null
        : date;
}


function formatSchedule(email) {

    const date = getEmailDate(email);

    if (!date) {
        return "Date and time not available";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatDateParts(email) {

    const date = getEmailDate(email);

    if (!date) {

        return {
            date: "Date not available",
            time: "Time not available"
        };

    }

    return {

        date:
            date.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ),

        time:
            date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )

    };
}


function getStatusText(status) {

    const value =
        String(
            status ||
            "scheduled"
        ).toLowerCase();


    const statusMap = {

        scheduled: "Scheduled",

        sending: "Sending",

        sent: "Delivered",

        delivered: "Delivered",

        opened: "Opened",

        failed: "Undelivered",

        undelivered: "Undelivered",

        cancelled: "Cancelled"

    };


    return (
        statusMap[value] ||
        "Scheduled"
    );
}


function getStatusClass(status) {

    const value =
        String(
            status ||
            "scheduled"
        ).toLowerCase();


    if (
        value === "sent" ||
        value === "delivered"
    ) {
        return "status-delivered";
    }


    if (
        value === "opened"
    ) {
        return "status-opened";
    }


    if (
        value === "failed" ||
        value === "undelivered"
    ) {
        return "status-undelivered";
    }


    if (
        value === "sending"
    ) {
        return "status-sending";
    }


    if (
        value === "cancelled"
    ) {
        return "status-cancelled";
    }


    return "status-scheduled";
}


function getRecipientName(emailAddress) {

    if (!emailAddress) {
        return "Recipient";
    }


    const namePart =
        emailAddress.split("@")[0];


    return (
        namePart
            .split(/[._-]+/)
            .filter(Boolean)
            .map(
                word =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ")
        ||
        "Recipient"
    );
}


function getInitial(value) {

    return (
        String(
            value ||
            "E"
        )
            .trim()
            .charAt(0)
            .toUpperCase()
        ||
        "E"
    );
}


/* =========================================
   DATE AND TIME SETUP
========================================= */

if (scheduleDate) {

    scheduleDate.min =
        new Date()
            .toISOString()
            .split("T")[0];

}


if (timezone) {

    const detectedTimezone =
        Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone;


    const timezoneExists =
        Array
            .from(timezone.options)
            .some(
                option =>
                    option.value ===
                    detectedTimezone
            );


    if (timezoneExists) {

        timezone.value =
            detectedTimezone;

    }

}


/* =========================================
   TO RECIPIENTS
========================================= */

if (
    recipientBox &&
    recipientInput
) {

    recipientBox.addEventListener(
        "click",
        () => recipientInput.focus()
    );

}


if (recipientInput) {

    recipientInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === ","
            ) {

                event.preventDefault();

                addRecipient(
                    recipientInput.value
                );

            }

        }
    );


    recipientInput.addEventListener(
        "blur",
        () => {

            if (
                recipientInput.value.trim()
            ) {

                addRecipient(
                    recipientInput.value
                );

            }

        }
    );

}


function addRecipient(email) {

    email =
        email
            .trim()
            .replace(/,/g, "");


    if (!email) {
        return;
    }


    if (!isValidEmail(email)) {

        alert(
            "Please enter a valid email address."
        );

        return;

    }


    if (
        !recipients.includes(email)
    ) {

        recipients.push(email);

        renderRecipients();

    }


    if (recipientInput) {

        recipientInput.value = "";

    }

}


function renderRecipients() {

    if (!recipientChips) {
        return;
    }


    recipientChips.innerHTML = "";


    recipients.forEach(
        email => {

            const chip =
                document.createElement("div");

            chip.className =
                "recipient-chip";


            chip.innerHTML = `

                <span>
                    ${escapeHTML(email)}
                </span>

                <span
                    class="remove-chip"
                    title="Remove"
                >
                    ×
                </span>

            `;


            const removeButton =
                chip.querySelector(
                    ".remove-chip"
                );


            if (removeButton) {

                removeButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        recipients =
                            recipients.filter(
                                item =>
                                    item !== email
                            );


                        renderRecipients();

                    }
                );

            }


            recipientChips.appendChild(chip);

        }
    );

}


/* =========================================
   CC AND BCC TOGGLE
========================================= */

if (
    toggleCc &&
    ccSection
) {

    toggleCc.addEventListener(
        "click",
        () => {

            ccSection.classList.toggle(
                "hidden"
            );

        }
    );

}


if (
    toggleBcc &&
    bccSection
) {

    toggleBcc.addEventListener(
        "click",
        () => {

            bccSection.classList.toggle(
                "hidden"
            );

        }
    );

}


/* =========================================
   CC RECIPIENTS
========================================= */

function addCcEmail() {

    if (!ccInput) {
        return;
    }


    const email =
        ccInput.value
            .trim()
            .replace(/,/g, "");


    if (!email) {
        return;
    }


    if (!isValidEmail(email)) {

        alert(
            "Please enter a valid email address."
        );

        return;

    }


    if (
        !ccRecipients.includes(email)
    ) {

        ccRecipients.push(email);

        renderCcRecipients();

    }


    ccInput.value = "";

}


function renderCcRecipients() {

    if (!ccChips) {
        return;
    }


    ccChips.innerHTML = "";


    ccRecipients.forEach(
        email => {

            const chip =
                createEmailChip(
                    email,
                    "cc"
                );


            ccChips.appendChild(chip);

        }
    );

}


if (ccInput) {

    ccInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === ","
            ) {

                event.preventDefault();

                addCcEmail();

            }

        }
    );


    ccInput.addEventListener(
        "blur",
        () => {

            if (
                ccInput.value.trim()
            ) {

                addCcEmail();

            }

        }
    );

}


/* =========================================
   BCC RECIPIENTS
========================================= */

function addBccEmail() {

    if (!bccInput) {
        return;
    }


    const email =
        bccInput.value
            .trim()
            .replace(/,/g, "");


    if (!email) {
        return;
    }


    if (!isValidEmail(email)) {

        alert(
            "Please enter a valid email address."
        );

        return;

    }


    if (
        !bccRecipients.includes(email)
    ) {

        bccRecipients.push(email);

        renderBccRecipients();

    }


    bccInput.value = "";

}


function renderBccRecipients() {

    if (!bccChips) {
        return;
    }


    bccChips.innerHTML = "";


    bccRecipients.forEach(
        email => {

            const chip =
                createEmailChip(
                    email,
                    "bcc"
                );


            bccChips.appendChild(chip);

        }
    );

}


if (bccInput) {

    bccInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === ","
            ) {

                event.preventDefault();

                addBccEmail();

            }

        }
    );


    bccInput.addEventListener(
        "blur",
        () => {

            if (
                bccInput.value.trim()
            ) {

                addBccEmail();

            }

        }
    );

}


/* =========================================
   CREATE EMAIL CHIP
========================================= */

function createEmailChip(
    email,
    type
) {

    const chip =
        document.createElement("div");


    chip.className =
        "email-chip";


    const emailText =
        document.createElement("span");


    emailText.textContent =
        email;


    const removeButton =
        document.createElement("button");


    removeButton.type =
        "button";


    removeButton.className =
        "remove-chip";


    removeButton.textContent =
        "×";


    removeButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            if (type === "cc") {

                ccRecipients =
                    ccRecipients.filter(
                        item =>
                            item !== email
                    );


                renderCcRecipients();

            }


            if (type === "bcc") {

                bccRecipients =
                    bccRecipients.filter(
                        item =>
                            item !== email
                    );


                renderBccRecipients();

            }

        }
    );


    chip.appendChild(emailText);

    chip.appendChild(removeButton);


    return chip;

}


/* =========================================
   TEXT EDITOR
========================================= */

document
    .querySelectorAll(
        ".editor-toolbar button[data-command]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document.execCommand(
                        button.dataset.command,
                        false,
                        null
                    );


                    if (messageEditor) {

                        messageEditor.focus();

                    }

                }
            );

        }
    );


const linkButton =
    document.getElementById(
        "linkButton"
    );


if (linkButton) {

    linkButton.addEventListener(
        "click",
        () => {

            const url =
                prompt(
                    "Enter the link URL:"
                );


            if (url) {

                document.execCommand(
                    "createLink",
                    false,
                    url
                );

            }

        }
    );

}


/* =========================================
   ATTACHMENTS
========================================= */

if (attachmentInput) {

    attachmentInput.addEventListener(
        "change",
        () => {

            const newFiles =
                Array.from(
                    attachmentInput.files
                );


            newFiles.forEach(
                file => {

                    const exists =
                        selectedFiles.some(
                            item =>
                                item.name === file.name
                                &&
                                item.size === file.size
                        );


                    if (!exists) {

                        selectedFiles.push(file);

                    }

                }
            );


            updateAttachmentInput();

            renderAttachments();

        }
    );

}


function updateAttachmentInput() {

    if (!attachmentInput) {
        return;
    }


    const transfer =
        new DataTransfer();


    selectedFiles.forEach(
        file => {

            transfer.items.add(file);

        }
    );


    attachmentInput.files =
        transfer.files;

}


function renderAttachments() {

    if (!attachmentList) {
        return;
    }


    attachmentList.innerHTML = "";


    selectedFiles.forEach(
        (file, index) => {

            const item =
                document.createElement("div");


            item.className =
                "attachment-item";


            item.innerHTML = `

                <div class="attachment-file-info">

                    <span>
                        📎
                    </span>

                    <span class="attachment-name">
                        ${escapeHTML(file.name)}
                    </span>

                </div>


                <div class="attachment-actions">

                    <button
                        type="button"
                        class="attachment-preview"
                    >
                        👁 View
                    </button>


                    <button
                        type="button"
                        class="attachment-remove"
                    >
                        ✕ Remove
                    </button>

                </div>

            `;


            const previewAttachment =
                item.querySelector(
                    ".attachment-preview"
                );


            const removeAttachment =
                item.querySelector(
                    ".attachment-remove"
                );


            if (previewAttachment) {

                previewAttachment.addEventListener(
                    "click",
                    () => {

                        const fileURL =
                            URL.createObjectURL(file);


                        window.open(
                            fileURL,
                            "_blank"
                        );

                    }
                );

            }


            if (removeAttachment) {

                removeAttachment.addEventListener(
                    "click",
                    () => {

                        selectedFiles.splice(
                            index,
                            1
                        );


                        updateAttachmentInput();

                        renderAttachments();

                    }
                );

            }


            attachmentList.appendChild(item);

        }
    );

}


/* =========================================
   SCHEDULE CONFIRMATION
========================================= */

[
    scheduleDate,
    scheduleTime,
    timezone
]
    .filter(Boolean)
    .forEach(
        element => {

            element.addEventListener(
                "change",
                updateScheduleConfirmation
            );

        }
    );


function updateScheduleConfirmation() {

    if (
        !scheduleDate ||
        !scheduleTime ||
        !scheduleConfirmation
    ) {
        return;
    }


    const date =
        scheduleDate.value;


    const time =
        scheduleTime.value;


    if (
        !date ||
        !time
    ) {

        scheduleConfirmation.textContent =
            "🕐 Select a date and time";

        return;

    }


    const selectedDateTime =
        new Date(
            `${date}T${time}`
        );


    if (
        selectedDateTime <
        new Date()
    ) {

        scheduleConfirmation.textContent =
            "⚠️ Please select a future date and time.";

        return;

    }


    const formattedDate =
        selectedDateTime.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );


    const formattedTime =
        selectedDateTime.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    scheduleConfirmation.textContent =
        `🕐 Will be sent on ${formattedDate} at ${formattedTime}`;

}


/* =========================================
   GET EMAIL DATA
========================================= */

function getEmailData() {

    return {

        recipients:
            [...recipients],

        cc:
            [...ccRecipients],

        bcc:
            [...bccRecipients],

        subject:
            subjectInput
                ? subjectInput.value
                : "",

        message:
            messageEditor
                ? messageEditor.innerHTML
                : "",

        date:
            scheduleDate
                ? scheduleDate.value
                : "",

        time:
            scheduleTime
                ? scheduleTime.value
                : "",

        timezone:
            timezone
                ? timezone.value
                : ""

    };

}


/* =========================================
   VALIDATE EMAIL
========================================= */

function validateEmail() {

    if (
        !recipients.length
    ) {

        alert(
            "Please add at least one recipient."
        );

        return false;

    }


    if (
        !subjectInput ||
        !subjectInput.value.trim()
    ) {

        alert(
            "Please enter an email subject."
        );

        return false;

    }


    if (
        !messageEditor ||
        !messageEditor.innerText.trim()
    ) {

        alert(
            "Please write an email message."
        );

        return false;

    }


    if (
        !scheduleDate ||
        !scheduleTime ||
        !scheduleDate.value ||
        !scheduleTime.value
    ) {

        alert(
            "Please select a date and time."
        );

        return false;

    }


    const selectedDateTime =
        new Date(
            `${scheduleDate.value}T${scheduleTime.value}`
        );


    if (
        selectedDateTime <=
        new Date()
    ) {

        alert(
            "Please select a future date and time."
        );

        return false;

    }


    return true;

}


/* =========================================
   COMPOSE EMAIL PREVIEW
========================================= */

if (previewButton) {

    previewButton.addEventListener(
        "click",
        openPreview
    );

}


function openPreview() {

    if (!validateEmail()) {
        return;
    }


    const data =
        getEmailData();


    if (!previewBody) {
        return;
    }


    previewBody.innerHTML = `

        <div class="preview-row">

            <span class="preview-label">
                To:
            </span>

            ${data.recipients
                .map(escapeHTML)
                .join(", ")}

        </div>


        ${
            data.cc.length
                ? `

                <div class="preview-row">

                    <span class="preview-label">
                        CC:
                    </span>

                    ${data.cc
                        .map(escapeHTML)
                        .join(", ")}

                </div>

                `
                : ""
        }


        ${
            data.bcc.length
                ? `

                <div class="preview-row">

                    <span class="preview-label">
                        BCC:
                    </span>

                    ${data.bcc
                        .map(escapeHTML)
                        .join(", ")}

                </div>

                `
                : ""
        }


        <div class="preview-row">

            <span class="preview-label">
                Subject:
            </span>

            ${escapeHTML(data.subject)}

        </div>


        <div class="preview-message">

            ${data.message}

        </div>


        <div class="preview-schedule">

            🕐
            <strong>
                Scheduled for
            </strong>

            <br>

            ${formatSchedule({
                scheduledTime:
                    `${data.date}T${data.time}`
            })}

        </div>

    `;


    if (previewModal) {

        previewModal.classList.remove(
            "hidden"
        );

    }

}


/* =========================================
   SCHEDULED EMAIL PREVIEW
========================================= */

window.previewScheduledEmail =
    function (id) {

        const email =
            scheduledEmails.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!email) {

            alert(
                "Email details not found."
            );

            return;

        }


        const emailRecipients =
            parseEmailList(
                email.recipients
            );


        const emailCc =
            parseEmailList(
                email.cc
            );


        const emailBcc =
            parseEmailList(
                email.bcc
            );


        if (!previewBody) {
            return;
        }


        previewBody.innerHTML = `

            <div class="preview-row">

                <span class="preview-label">
                    To:
                </span>

                ${emailRecipients
                    .map(escapeHTML)
                    .join(", ")}

            </div>


            ${
                emailCc.length
                    ? `

                    <div class="preview-row">

                        <span class="preview-label">
                            CC:
                        </span>

                        ${emailCc
                            .map(escapeHTML)
                            .join(", ")}

                    </div>

                    `
                    : ""
            }


            ${
                emailBcc.length
                    ? `

                    <div class="preview-row">

                        <span class="preview-label">
                            BCC:
                        </span>

                        ${emailBcc
                            .map(escapeHTML)
                            .join(", ")}

                    </div>

                    `
                    : ""
            }


            <div class="preview-row">

                <span class="preview-label">
                    Subject:
                </span>

                ${escapeHTML(
                    email.subject ||
                    "No Subject"
                )}

            </div>


            <div class="preview-message">

                ${
                    email.message ||
                    "No message content."
                }

            </div>


            <div class="preview-schedule">

                🕐
                <strong>
                    Scheduled for
                </strong>

                <br>

                ${formatSchedule(email)}

            </div>

        `;


        if (previewModal) {

            previewModal.classList.remove(
                "hidden"
            );

        }

    };


    


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal() {

    if (previewModal) {

        previewModal.classList.add(
            "hidden"
        );

    }

}


if (closePreview) {

    closePreview.addEventListener(
        "click",
        closeModal
    );

}


if (editButton) {

    editButton.addEventListener(
        "click",
        closeModal
    );

}


const modalOverlay =
    document.querySelector(
        ".modal-overlay"
    );


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target === modalOverlay
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================
   SEND / SCHEDULE EMAIL
========================================= */

if (scheduleButton) {

    scheduleButton.addEventListener(
        "click",
        scheduleEmail
    );

}


if (confirmScheduleButton) {

    confirmScheduleButton.addEventListener(
        "click",
        scheduleEmail
    );

}


async function scheduleEmail() {

    if (!validateEmail()) {
        return;
    }


    try {

        if (scheduleButton) {

            scheduleButton.disabled = true;

        }


        if (confirmScheduleButton) {

            confirmScheduleButton.disabled = true;

        }


        const scheduledDateTime =
            new Date(
                `${scheduleDate.value}T${scheduleTime.value}`
            );


        const formData =
            new FormData();


        formData.append(
            "recipients",
            JSON.stringify(recipients)
        );


        formData.append(
            "cc",
            JSON.stringify(ccRecipients)
        );


        formData.append(
            "bcc",
            JSON.stringify(bccRecipients)
        );


        formData.append(
            "subject",
            subjectInput.value.trim()
        );


        formData.append(
            "message",
            messageEditor.innerHTML
        );


        formData.append(
            "scheduledTime",
            scheduledDateTime.toISOString()
        );


        formData.append(
            "timezone",
            timezone
                ? timezone.value
                : ""
        );


        selectedFiles.forEach(
            file => {

                formData.append(
                    "attachments",
                    file
                );

            }
        );


        const response =
            await fetch(
                `${API_URL}/emails`,
                {
                    method: "POST",
                    body: formData
                }
            );


        let result = {};


        try {

            result =
                await response.json();

        }

        catch (error) {

            result = {};

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to schedule email."
            );

        }


        closeModal();


        alert(
            "Email scheduled successfully!"
        );


        resetForm();


        await loadScheduledEmails();


        showScheduledView();

    }


    catch (error) {

        console.error(
            "Scheduling error:",
            error
        );


        alert(
            error.message ||
            "Something went wrong while scheduling the email."
        );

    }


    finally {

        if (scheduleButton) {

            scheduleButton.disabled = false;

        }


        if (confirmScheduleButton) {

            confirmScheduleButton.disabled = false;

        }

    }

}


/* =========================================
   RESET FORM
========================================= */

function resetForm() {

    recipients = [];

    ccRecipients = [];

    bccRecipients = [];

    selectedFiles = [];


    renderRecipients();

    renderCcRecipients();

    renderBccRecipients();


    if (recipientInput) {

        recipientInput.value = "";

    }


    if (ccInput) {

        ccInput.value = "";

    }


    if (bccInput) {

        bccInput.value = "";

    }


    if (subjectInput) {

        subjectInput.value = "";

    }


    if (messageEditor) {

        messageEditor.innerHTML = "";

    }


    if (scheduleDate) {

        scheduleDate.value = "";

    }


    if (scheduleTime) {

        scheduleTime.value = "";

    }


    if (attachmentInput) {

        attachmentInput.value = "";

    }


    updateAttachmentInput();

    renderAttachments();


    if (scheduleConfirmation) {

        scheduleConfirmation.textContent =
            "🕐 Select a date and time";

    }

}


/* =========================================
   VIEW SWITCHING
========================================= */

if (scheduledNav) {

    scheduledNav.addEventListener(
        "click",
        async () => {

            showScheduledView();

            await loadScheduledEmails();

        }
    );

}


if (backButton) {

    backButton.addEventListener(
        "click",
        showComposeView
    );

}


if (createEmailButton) {

    createEmailButton.addEventListener(
        "click",
        showComposeView
    );

}


function showScheduledView() {

    if (composeView) {

        composeView.classList.add(
            "hidden"
        );

    }


    if (scheduledView) {

        scheduledView.classList.remove(
            "hidden"
        );

    }

}


function showComposeView() {

    if (scheduledView) {

        scheduledView.classList.add(
            "hidden"
        );

    }


    if (composeView) {

        composeView.classList.remove(
            "hidden"
        );

    }

}


/* =========================================
   LOAD EMAILS
========================================= */

async function loadScheduledEmails() {

    try {

        const response =
            await fetch(
                `${API_URL}/emails`
            );


        let result = {};


        try {

            result =
                await response.json();

        }

        catch (error) {

            result = {};

        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load emails."
            );

        }


        scheduledEmails =
            Array.isArray(
                result.emails
            )
                ? result.emails
                : [];


        updateDashboard();

        updateScheduledCount();


        currentPage = 1;


        renderScheduledEmails();

    }


    catch (error) {

        console.error(
            "Loading emails error:",
            error
        );


        scheduledEmails = [];


        updateDashboard();

        updateScheduledCount();

        renderScheduledEmails();

    }

}


/* =========================================
   UPDATE SCHEDULED COUNT
========================================= */

function updateScheduledCount() {

    if (!scheduledCount) {
        return;
    }


    const activeEmails =
        scheduledEmails.filter(
            email => {

                const status =
                    String(
                        email.status ||
                        "scheduled"
                    ).toLowerCase();


                return (
                    status ===
                    "scheduled"
                );

            }
        );


    scheduledCount.textContent =
        activeEmails.length;

}


/* =========================================
   FILTERED EMAILS
========================================= */

function getFilteredEmails() {

    const search =
        (
            emailSearch
                ? emailSearch.value
                : ""
        )
            .trim()
            .toLowerCase();


    let emails =
        [...scheduledEmails];


    if (
        currentFilter !==
        "all"
    ) {

        emails =
            emails.filter(
                email => {

                    const status =
                        String(
                            email.status ||
                            "scheduled"
                        ).toLowerCase();


                    if (
                        currentFilter ===
                        "delivered"
                    ) {

                        return (
                            status === "sent" ||
                            status === "delivered"
                        );

                    }


                    if (
                        currentFilter ===
                        "undelivered"
                    ) {

                        return (
                            status === "scheduled" ||
                            status === "undelivered"
                        );

                    }


                    return (
                        status ===
                        currentFilter
                    );

                }
            );

    }


    if (search) {

        emails =
            emails.filter(
                email => {

                    const recipientsList =
                        parseEmailList(
                            email.recipients
                        ).join(" ");


                    const text = [

                        email.subject,

                        email.message,

                        email.status,

                        recipientsList

                    ]
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        search
                    );

                }
            );

    }


    emails.sort(
        (a, b) => {

            const dateA =
                getEmailDate(a)
                    ?.getTime()
                ||
                0;


            const dateB =
                getEmailDate(b)
                    ?.getTime()
                ||
                0;


            return (
                dateSortDirection ===
                "desc"
            )
                ? dateB - dateA
                : dateA - dateB;

        }
    );


    return emails;

}


function renderScheduledEmails() {

    if (!scheduledList) {
        return;
    }


    const filteredEmails =
        getFilteredEmails();


    const totalItems =
        filteredEmails.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalItems /
                rowsPerPage
            )
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    const startIndex =
        (currentPage - 1) *
        rowsPerPage;


    const pageEmails =
        filteredEmails.slice(
            startIndex,
            startIndex +
            rowsPerPage
        );


    scheduledList.innerHTML =
        "";


    if (!totalItems) {

        if (emptyState) {

            emptyState.classList.remove(
                "hidden"
            );

        }


        updateTableInfo(
            0,
            0,
            0
        );


        renderPagination(
            0
        );


        return;

    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }


    pageEmails.forEach(
        email => {

            const recipientsList =
                parseEmailList(
                    email.recipients
                );


            const firstRecipient =
                recipientsList[0] ||
                "No recipient";


            const recipientName =
                getRecipientName(
                    firstRecipient
                );


            const statusText =
                getStatusText(
                    email.status
                );


            const statusClass =
                getStatusClass(
                    email.status
                );


            const dateParts =
                formatDateParts(
                    email
                );


            const previewText =
                stripHTML(
                    email.message
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td class="email-details-cell">

                    <div class="email-detail">

                        <div class="email-avatar">

                            ${escapeHTML(
                                getInitial(
                                    email.subject ||
                                    recipientName
                                )
                            )}

                        </div>


                        <div class="email-detail-text">

                            <div class="email-subject">

                                ${escapeHTML(
                                    email.subject ||
                                    "No Subject"
                                )}

                            </div>


                            <div class="email-address">

                                ${escapeHTML(
                                    firstRecipient
                                )}

                            </div>


                            ${
                                previewText
                                    ? `

                                    <div class="email-preview-text">

                                        ${escapeHTML(
                                            previewText
                                        )}

                                    </div>

                                    `
                                    : ""
                            }

                        </div>

                    </div>

                </td>


                <td class="date-cell">

                    <div class="date-line">

                        <span class="date-icon">
                            ▣
                        </span>

                        <span>

                            ${escapeHTML(
                                dateParts.date
                            )}

                        </span>

                    </div>


                    <div class="time-line">

                        <span class="time-icon">
                            ◷
                        </span>

                        <span>

                            ${escapeHTML(
                                dateParts.time
                            )}

                        </span>

                    </div>

                </td>


                <td class="status-cell">

                    <span
                        class="status-badge ${statusClass}"
                    >

                        <span>

                            ${
                                statusClass ===
                                "status-opened"
                                    ? "◉"
                                    : "◌"
                            }

                        </span>

                        ${escapeHTML(
                            statusText
                        )}

                    </span>

                </td>


                <td class="recipient-cell">

                    <div class="recipient-name">

                        ${escapeHTML(
                            recipientName
                        )}

                    </div>


                    <div class="recipient-email">

                        ${escapeHTML(
                            firstRecipient
                        )}

                    </div>

                </td>


                <td class="action-cell">

                    <div class="email-action-buttons">

                        <button
                            type="button"
                            class="preview-table-btn"
                            data-preview-id="${escapeHTML(email.id)}"
                        >

                            ◉ Preview

                        </button>


                        ${
                            statusClass ===
                            "status-delivered"

                                ? `

                                <button
                                    type="button"
                                    class="delete-table-btn"
                                    data-delete-id="${escapeHTML(email.id)}"
                                >

                                    🗑 Delete

                                </button>

                                `

                                : ""
                        }

                    </div>

                </td>

            `;


            /* ===============================
               PREVIEW BUTTON
            =============================== */

            const previewButton =
                row.querySelector(
                    ".preview-table-btn"
                );


            if (previewButton) {

                previewButton.addEventListener(
                    "click",
                    () => {

                        window.previewScheduledEmail(
                            email.id
                        );

                    }
                );

            }


            /* ===============================
               DELETE BUTTON
            =============================== */

            const deleteButton =
                row.querySelector(
                    ".delete-table-btn"
                );


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    async () => {

                        const confirmed =
                            confirm(
                                "Are you sure you want to delete this email?"
                            );


                        if (!confirmed) {
                            return;
                        }


                        try {

                            deleteButton.disabled =
                                true;


                            deleteButton.textContent =
                                "Deleting...";


                            const response =
                                await fetch(
                                    `${API_URL}/emails/${email.id}`,
                                    {
                                        method:
                                            "DELETE"
                                    }
                                );


                            let result =
                                {};


                            try {

                                result =
                                    await response.json();

                            }

                            catch (error) {

                                result =
                                    {};

                            }


                            if (!response.ok) {

                                throw new Error(
                                    result.message ||
                                    "Unable to delete email."
                                );

                            }


                            /* =================================
                               REMOVE EMAIL FROM LOCAL ARRAY
                            ================================= */

                            scheduledEmails =
                                scheduledEmails.filter(
                                    item =>

                                        String(
                                            item.id
                                        ) !==

                                        String(
                                            email.id
                                        )
                                );


                            /* =================================
                               UPDATE COUNTS
                            ================================= */

                            updateDashboard();


                            updateScheduledCount();


                            /* =================================
                               CHECK CURRENT PAGE
                            ================================= */

                            const remainingEmails =
                                getFilteredEmails()
                                    .length;


                            const newTotalPages =
                                Math.max(
                                    1,
                                    Math.ceil(
                                        remainingEmails /
                                        rowsPerPage
                                    )
                                );


                            if (
                                currentPage >
                                newTotalPages
                            ) {

                                currentPage =
                                    newTotalPages;

                            }


                            /* =================================
                               RE-RENDER TABLE
                            ================================= */

                            renderScheduledEmails();


                            alert(
                                "Email deleted successfully!"
                            );

                        }

                        catch (error) {

                            console.error(
                                "Delete error:",
                                error
                            );


                            alert(
                                error.message ||
                                "Unable to delete email."
                            );


                            deleteButton.disabled =
                                false;


                            deleteButton.innerHTML =
                                "🗑 Delete";

                        }

                    }
                );

            }


            scheduledList.appendChild(
                row
            );

        }
    );


    const startDisplay =
        startIndex + 1;


    const endDisplay =
        Math.min(
            startIndex +
            rowsPerPage,
            totalItems
        );


    updateTableInfo(
        startDisplay,
        endDisplay,
        totalItems
    );


    renderPagination(
        totalPages
    );

}

/* =========================================
   TABLE INFORMATION
========================================= */

function updateTableInfo(
    start,
    end,
    total
) {

    if (!tableInfo) {
        return;
    }


    tableInfo.textContent =
        total === 0

            ? "Showing 0 to 0 of 0 emails"

            : `Showing ${start} to ${end} of ${total} emails`;

}


/* =========================================
   PAGINATION
========================================= */

function renderPagination(totalPages) {

    if (!pageNumbers) {
        return;
    }


    pageNumbers.innerHTML = "";


    if (
        totalPages > 1
    ) {

        const visiblePages = [];


        if (
            totalPages <= 5
        ) {

            for (
                let page = 1;
                page <= totalPages;
                page++
            ) {

                visiblePages.push(page);

            }

        }

        else {

            const start =
                Math.max(
                    1,
                    currentPage - 2
                );


            const end =
                Math.min(
                    totalPages,
                    start + 4
                );


            for (
                let page = start;
                page <= end;
                page++
            ) {

                visiblePages.push(page);

            }

        }


        visiblePages.forEach(
            page => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.textContent =
                    page;


                if (
                    page ===
                    currentPage
                ) {

                    button.classList.add(
                        "active-page"
                    );

                }


                button.addEventListener(
                    "click",
                    () => {

                        currentPage = page;

                        renderScheduledEmails();

                    }
                );


                pageNumbers.appendChild(
                    button
                );

            }
        );

    }


    if (prevPage) {

        prevPage.disabled =
            currentPage <= 1;

    }


    if (nextPage) {

        nextPage.disabled =
            currentPage >=
            Math.max(
                1,
                totalPages
            );

    }

}


/* =========================================
   UPDATE DASHBOARD
========================================= */

function updateDashboard() {

    const total =
        scheduledEmails.length;


    /* =========================================
       DELIVERED EMAILS
    ========================================= */

    const delivered =
        scheduledEmails.filter(
            email => {

                const status =
                    String(
                        email.status || ""
                    ).toLowerCase();


                return (
                    status === "sent" ||
                    status === "delivered"
                );

            }
        ).length;


    /* =========================================
       UNDELIVERED EMAILS

       Scheduled emails are included here.
    ========================================= */

    const undelivered =
        scheduledEmails.filter(
            email => {

                const status =
                    String(
                        email.status || "scheduled"
                    ).toLowerCase();


                return (

                    status === "scheduled" ||

                    status === "failed" ||

                    status === "undelivered"

                );

            }
        ).length;


    /* =========================================
       UPDATE TOTAL COUNT
    ========================================= */

    if (totalSentCount) {

        totalSentCount.textContent =
            total;

    }


    /* =========================================
       UPDATE DELIVERED COUNT
    ========================================= */

    if (deliveredCount) {

        deliveredCount.textContent =
            delivered;

    }


    /* =========================================
       UPDATE UNDELIVERED COUNT
    ========================================= */

    if (undeliveredCount) {

        undeliveredCount.textContent =
            undelivered;

    }

}

/* =========================================
   SEARCH
========================================= */

if (emailSearch) {

    emailSearch.addEventListener(
        "input",
        () => {

            currentPage = 1;

            renderScheduledEmails();

        }
    );

}


/* =========================================
   FILTER
========================================= */

if (filterButton) {

    filterButton.addEventListener(
        "click",
        () => {

            const filters = [

                "all",

                "scheduled",

                "delivered",

                "undelivered"

            ];


            const labels = {

                all:
                    "Filter",

                scheduled:
                    "Scheduled",

                delivered:
                    "Delivered",

                undelivered:
                    "Undelivered"

            };


            const currentIndex =
                filters.indexOf(
                    currentFilter
                );


            currentFilter =
                filters[
                    (
                        currentIndex + 1
                    )
                    %
                    filters.length
                ];


            if (filterLabel) {

                filterLabel.textContent =
                    labels[currentFilter];

            }


            currentPage = 1;


            renderScheduledEmails();

        }
    );

}


/* =========================================
   SORT DATE
========================================= */

if (sortDateButton) {

    sortDateButton.addEventListener(
        "click",
        () => {

            dateSortDirection =
                dateSortDirection ===
                "desc"

                    ? "asc"

                    : "desc";


            if (sortArrow) {

                sortArrow.textContent =
                    dateSortDirection ===
                    "desc"

                        ? "↓"

                        : "↑";

            }


            renderScheduledEmails();

        }
    );

}


/* =========================================
   PREVIOUS PAGE
========================================= */

if (prevPage) {

    prevPage.addEventListener(
        "click",
        () => {

            if (
                currentPage > 1
            ) {

                currentPage--;

                renderScheduledEmails();

            }

        }
    );

}


/* =========================================
   NEXT PAGE
========================================= */

if (nextPage) {

    nextPage.addEventListener(
        "click",
        () => {

            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        getFilteredEmails()
                            .length
                        /
                        rowsPerPage
                    )
                );


            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                renderScheduledEmails();

            }

        }
    );

}


/* =========================================
   INITIAL LOAD
========================================= */

loadScheduledEmails();