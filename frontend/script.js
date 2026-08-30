/* =========================================
   API CONFIGURATION
========================================= */

const API_URL =
    "http://localhost:5000/api";


/* =========================================
   ELEMENTS
========================================= */

const recipientInput =
    document.getElementById("recipientInput");

const recipientBox =
    document.getElementById("recipientBox");

const recipientChips =
    document.getElementById("recipientChips");


const toggleCc =
    document.getElementById("toggleCc");

const toggleBcc =
    document.getElementById("toggleBcc");


const ccSection =
    document.getElementById("ccSection");

const bccSection =
    document.getElementById("bccSection");


const subjectInput =
    document.getElementById("subjectInput");

const messageEditor =
    document.getElementById("messageEditor");


const scheduleDate =
    document.getElementById("scheduleDate");

const scheduleTime =
    document.getElementById("scheduleTime");

const timezone =
    document.getElementById("timezone");


const scheduleConfirmation =
    document.getElementById("scheduleConfirmation");


const previewButton =
    document.getElementById("previewButton");

const previewModal =
    document.getElementById("previewModal");

const closePreview =
    document.getElementById("closePreview");

const editButton =
    document.getElementById("editButton");

const confirmScheduleButton =
    document.getElementById("confirmScheduleButton");


const scheduleButton =
    document.getElementById("scheduleButton");


const previewBody =
    document.getElementById("previewBody");


const attachmentInput =
    document.getElementById("attachmentInput");

const attachmentList =
    document.getElementById("attachmentList");


const scheduledNav =
    document.getElementById("scheduledNav");

const scheduledView =
    document.getElementById("scheduledView");

const composeView =
    document.getElementById("composeView");

const backButton =
    document.getElementById("backButton");

const scheduledList =
    document.getElementById("scheduledList");

const emptyState =
    document.getElementById("emptyState");

const scheduledCount =
    document.getElementById("scheduledCount");

const createEmailButton =
    document.getElementById("createEmailButton");


/* =========================================
   DATA
========================================= */

let recipients = [];

let scheduledEmails = [];


/* =========================================
   DEFAULT DATE
========================================= */

const today =
    new Date();


const formattedToday =
    today
        .toISOString()
        .split("T")[0];


scheduleDate.min =
    formattedToday;


/* =========================================
   DETECT TIMEZONE
========================================= */

const detectedTimezone =
    Intl
        .DateTimeFormat()
        .resolvedOptions()
        .timeZone;


const timezoneOptions =
    Array.from(
        timezone.options
    );


const timezoneExists =
    timezoneOptions.some(
        option =>
            option.value ===
            detectedTimezone
    );


if (
    timezoneExists
) {

    timezone.value =
        detectedTimezone;

}


/* =========================================
   RECIPIENT INPUT
========================================= */

recipientBox.addEventListener(
    "click",
    () => {

        recipientInput.focus();

    }
);


recipientInput.addEventListener(
    "keydown",
    function (event) {

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
    function () {

        if (
            recipientInput.value.trim()
        ) {

            addRecipient(
                recipientInput.value
            );

        }

    }
);


/* =========================================
   ADD RECIPIENT
========================================= */

function addRecipient(email) {

    email =
        email
            .trim()
            .replace(",", "");


    if (
        !email
    ) {

        return;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            email
        )
    ) {

        alert(
            "Please enter a valid email address."
        );

        return;

    }


    if (
        recipients.includes(
            email
        )
    ) {

        recipientInput.value =
            "";

        return;

    }


    recipients.push(
        email
    );


    renderRecipients();


    recipientInput.value =
        "";

}


/* =========================================
   RENDER RECIPIENTS
========================================= */

function renderRecipients() {

    recipientChips.innerHTML =
        "";


    recipients.forEach(
        email => {

            const chip =
                document.createElement(
                    "div"
                );


            chip.className =
                "recipient-chip";


            chip.innerHTML = `

                <span>
                    ${email}
                </span>

                <span
                    class="remove-chip"
                    data-email="${email}"
                >
                    ×
                </span>

            `;


            recipientChips.appendChild(
                chip
            );

        }
    );


    document
        .querySelectorAll(
            ".remove-chip"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const email =
                            this.dataset.email;


                        recipients =
                            recipients.filter(
                                item =>
                                    item !==
                                    email
                            );


                        renderRecipients();

                    }
                );

            }
        );

}


/* =========================================
   CC / BCC
========================================= */

toggleCc.addEventListener(
    "click",
    () => {

        ccSection.classList.toggle(
            "hidden"
        );

    }
);


toggleBcc.addEventListener(
    "click",
    () => {

        bccSection.classList.toggle(
            "hidden"
        );

    }
);


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

                    const command =
                        button.dataset.command;


                    document.execCommand(
                        command,
                        false,
                        null
                    );


                    messageEditor.focus();

                }
            );

        }
    );


/* =========================================
   INSERT LINK
========================================= */

document
    .getElementById(
        "linkButton"
    )
    .addEventListener(
        "click",
        () => {

            const url =
                prompt(
                    "Enter the link URL:"
                );


            if (
                url
            ) {

                document.execCommand(
                    "createLink",
                    false,
                    url
                );

            }

        }
    );


/* =========================================
   ATTACHMENTS
========================================= */

attachmentInput.addEventListener(
    "change",
    function () {

        attachmentList.innerHTML =
            "";


        Array
            .from(
                attachmentInput.files
            )
            .forEach(
                file => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "attachment-item";


                    item.textContent =
                        `📎 ${file.name}`;


                    attachmentList.appendChild(
                        item
                    );

                }
            );

    }
);


/* =========================================
   SCHEDULE CONFIRMATION
========================================= */

scheduleDate.addEventListener(
    "change",
    updateScheduleConfirmation
);


scheduleTime.addEventListener(
    "change",
    updateScheduleConfirmation
);


timezone.addEventListener(
    "change",
    updateScheduleConfirmation
);


function updateScheduleConfirmation() {

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
        selectedDateTime
            .toLocaleDateString(
                "en-IN",
                {

                    weekday:
                        "long",

                    day:
                        "numeric",

                    month:
                        "short",

                    year:
                        "numeric"

                }
            );


    const formattedTime =
        selectedDateTime
            .toLocaleTimeString(
                "en-IN",
                {

                    hour:
                        "2-digit",

                    minute:
                        "2-digit"

                }
            );


    scheduleConfirmation.textContent =
        `🕐 Will be sent on ${formattedDate} at ${formattedTime}`;

}


/* =========================================
   GET FORM DATA
========================================= */

function getEmailData() {

    return {

        recipients:
            recipients,


        cc:
            document
                .getElementById(
                    "ccInput"
                )
                .value,


        bcc:
            document
                .getElementById(
                    "bccInput"
                )
                .value,


        subject:
            subjectInput.value,


        message:
            messageEditor.innerHTML,


        date:
            scheduleDate.value,


        time:
            scheduleTime.value,


        timezone:
            timezone.value

    };

}


/* =========================================
   VALIDATE FORM
========================================= */

function validateEmail() {

    if (
        recipients.length === 0
    ) {

        alert(
            "Please add at least one recipient."
        );

        return false;

    }


    if (
        !subjectInput.value.trim()
    ) {

        alert(
            "Please enter an email subject."
        );

        return false;

    }


    if (
        !messageEditor.innerText.trim()
    ) {

        alert(
            "Please write an email message."
        );

        return false;

    }


    if (
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
   PREVIEW EMAIL
========================================= */

previewButton.addEventListener(
    "click",
    openPreview
);


function openPreview() {

    if (
        !validateEmail()
    ) {

        return;

    }


    const data =
        getEmailData();


    previewBody.innerHTML = `

        <div class="preview-row">

            <span class="preview-label">
                To:
            </span>

            ${data.recipients.join(", ")}

        </div>


        ${
            data.cc
                ? `
                <div class="preview-row">

                    <span class="preview-label">
                        CC:
                    </span>

                    ${data.cc}

                </div>
                `
                : ""
        }


        ${
            data.bcc
                ? `
                <div class="preview-row">

                    <span class="preview-label">
                        BCC:
                    </span>

                    ${data.bcc}

                </div>
                `
                : ""
        }


        <div class="preview-row">

            <span class="preview-label">
                Subject:
            </span>

            ${data.subject}

        </div>


        <div class="preview-message">

            ${data.message}

        </div>


        <div class="preview-schedule">

            🕐 <strong>
                Scheduled for
            </strong>

            <br>

            ${formatSchedule(data)}

        </div>

    `;


    previewModal.classList.remove(
        "hidden"
    );

}


/* =========================================
   CLOSE MODAL
========================================= */

closePreview.addEventListener(
    "click",
    closeModal
);


editButton.addEventListener(
    "click",
    closeModal
);


document
    .querySelector(
        ".modal-overlay"
    )
    .addEventListener(
        "click",
        closeModal
    );


function closeModal() {

    previewModal.classList.add(
        "hidden"
    );

}


/* =========================================
   FORMAT SCHEDULE
========================================= */

function formatSchedule(data) {

    let dateTime;


    if (
        data.scheduled_time
    ) {

        dateTime =
            new Date(
                data.scheduled_time
            );

    }

    else {

        dateTime =
            new Date(
                `${data.date}T${data.time}`
            );

    }


    const formattedDate =
        dateTime.toLocaleDateString(
            "en-IN",
            {

                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"

            }
        );


    const formattedTime =
        dateTime.toLocaleTimeString(
            "en-IN",
            {

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }
        );


    return `

        ${formattedDate}
        ·
        ${formattedTime}

    `;

}


/* =========================================
   SCHEDULE EMAIL
   SEND TO BACKEND
========================================= */

scheduleButton.addEventListener(
    "click",
    scheduleEmail
);


confirmScheduleButton.addEventListener(
    "click",
    scheduleEmail
);


async function scheduleEmail() {

    if (
        !validateEmail()
    ) {

        return;

    }


    try {

        /* =================================
           PREVENT DOUBLE CLICK
        ================================= */

        scheduleButton.disabled =
            true;


        confirmScheduleButton.disabled =
            true;


        /* =================================
           GET CC / BCC
        ================================= */

        const ccInput =
            document.getElementById(
                "ccInput"
            );


        const bccInput =
            document.getElementById(
                "bccInput"
            );


        const cc =
            ccInput.value
                .split(",")

                .map(
                    email =>
                        email.trim()
                )

                .filter(
                    email =>
                        email !== ""
                );


        const bcc =
            bccInput.value
                .split(",")

                .map(
                    email =>
                        email.trim()
                )

                .filter(
                    email =>
                        email !== ""
                );


        /* =================================
           COMBINE DATE + TIME
        ================================= */

        const scheduledDateTime =
            new Date(
                `${scheduleDate.value}T${scheduleTime.value}`
            );


        /* =================================
           CREATE FORM DATA
        ================================= */

        const formData =
            new FormData();


        formData.append(

            "recipients",

            JSON.stringify(
                recipients
            )

        );


        formData.append(

            "cc",

            JSON.stringify(
                cc
            )

        );


        formData.append(

            "bcc",

            JSON.stringify(
                bcc
            )

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


        /* =================================
           ADD ATTACHMENTS
        ================================= */

        Array
            .from(
                attachmentInput.files
            )
            .forEach(
                file => {

                    formData.append(
                        "attachments",
                        file
                    );

                }
            );


        console.log(
            "Sending email data to backend..."
        );


        /* =================================
           SEND TO BACKEND
        ================================= */

        const response =
            await fetch(

                `${API_URL}/emails`,

                {

                    method:
                        "POST",

                    body:
                        formData

                }

            );


        const result =
            await response.json();


        console.log(
            "Backend response:",
            result
        );


        /* =================================
           HANDLE ERROR
        ================================= */

        if (
            !response.ok
        ) {

            throw new Error(

                result.message ||

                "Unable to schedule email."

            );

        }


        /* =================================
           SUCCESS
        ================================= */

        closeModal();


        alert(
            "Email scheduled successfully!"
        );


        resetForm();


        await loadScheduledEmails();


        updateScheduledCount();


        showScheduledView();

    }

    catch (
        error
    ) {

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

        scheduleButton.disabled =
            false;


        confirmScheduleButton.disabled =
            false;

    }

}


/* =========================================
   LOAD EMAILS FROM BACKEND
========================================= */

async function loadScheduledEmails() {

    try {

        const response =
            await fetch(
                `${API_URL}/emails`
            );


        const result =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                "Unable to load emails."
            );

        }


        scheduledEmails =
            result.emails;


        renderScheduledEmails();


        updateScheduledCount();

    }

    catch (
        error
    ) {

        console.error(
            "Loading emails error:",
            error
        );

    }

}


/* =========================================
   RESET FORM
========================================= */

function resetForm() {

    recipients =
        [];


    renderRecipients();


    subjectInput.value =
        "";


    document
        .getElementById(
            "ccInput"
        )
        .value =
        "";


    document
        .getElementById(
            "bccInput"
        )
        .value =
        "";


    messageEditor.innerHTML =
        "";


    scheduleDate.value =
        "";


    scheduleTime.value =
        "";


    attachmentInput.value =
        "";


    attachmentList.innerHTML =
        "";


    scheduleConfirmation.textContent =
        "🕐 Select a date and time";

}


/* =========================================
   SCHEDULED VIEW
========================================= */

scheduledNav.addEventListener(
    "click",
    async () => {

        await showScheduledView();

    }
);


backButton.addEventListener(
    "click",
    showComposeView
);


createEmailButton.addEventListener(
    "click",
    showComposeView
);


async function showScheduledView() {

    composeView.classList.add(
        "hidden"
    );


    scheduledView.classList.remove(
        "hidden"
    );


    await loadScheduledEmails();

}


function showComposeView() {

    scheduledView.classList.add(
        "hidden"
    );


    composeView.classList.remove(
        "hidden"
    );

}


/* =========================================
   RENDER SCHEDULED EMAILS
========================================= */

function renderScheduledEmails() {

    scheduledList.innerHTML =
        "";


    if (
        scheduledEmails.length === 0
    ) {

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    scheduledEmails.forEach(
        email => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "scheduled-item";


            /* =============================
               RECIPIENTS
            ============================= */

            let emailRecipients =
                [];


            try {

                emailRecipients =
                    JSON.parse(
                        email.recipients
                    );

            }

            catch {

                emailRecipients =
                    [email.recipients];

            }


            /* =============================
               STATUS
            ============================= */

            let statusText =
                email.status;


            if (
                email.status ===
                "scheduled"
            ) {

                statusText =
                    "🟡 Scheduled";

            }

            else if (
                email.status ===
                "sending"
            ) {

                statusText =
                    "🔵 Sending";

            }

            else if (
                email.status ===
                "sent"
            ) {

                statusText =
                    "🟢 Sent";

            }

            else if (
                email.status ===
                "failed"
            ) {

                statusText =
                    "🔴 Failed";

            }

            else if (
                email.status ===
                "cancelled"
            ) {

                statusText =
                    "⚫ Cancelled";

            }


            /* =============================
               ACTION BUTTON
            ============================= */

            let actionButton =
                "";


            if (
                email.status ===
                "scheduled"
            ) {

                actionButton = `

                    <button
                        class="small-btn delete-btn"
                        onclick="deleteEmail(${email.id})"
                    >

                        Cancel

                    </button>

                `;

            }


            item.innerHTML = `

                <div class="scheduled-info">

                    <h3>

                        ${escapeHTML(
                            email.subject
                        )}

                    </h3>


                    <p>

                        ${emailRecipients
                            .map(
                                escapeHTML
                            )
                            .join(", ")
                        }

                    </p>


                    <p>

                        ${formatSchedule(
                            email
                        )}

                    </p>


                    <span class="status">

                        ${statusText}

                    </span>

                </div>


                <div class="item-actions">

                    ${actionButton}

                </div>

            `;


            scheduledList.appendChild(
                item
            );

        }
    );

}


/* =========================================
   CANCEL EMAIL
========================================= */

async function deleteEmail(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to cancel this scheduled email?"
        );


    if (
        !confirmDelete
    ) {

        return;

    }


    try {

        const response =
            await fetch(

                `${API_URL}/emails/${id}/cancel`,

                {

                    method:
                        "PATCH"

                }

            );


        const result =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(

                result.message ||

                "Unable to cancel email."

            );

        }


        alert(
            "Email cancelled successfully."
        );


        await loadScheduledEmails();

    }

    catch (
        error
    ) {

        console.error(
            "Cancel error:",
            error
        );


        alert(
            error.message
        );

    }

}


/* =========================================
   UPDATE COUNT
========================================= */

function updateScheduledCount() {

    const activeEmails =
        scheduledEmails.filter(
            email =>

                email.status ===
                "scheduled"
        );


    scheduledCount.textContent =
        activeEmails.length;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================
   INITIAL LOAD
========================================= */

loadScheduledEmails();