/*
 * =========================================================
 * CONTACTFINDER
 * ZENTRALE APP.JS
 * =========================================================
 *
 * Diese Datei übernimmt ALLES:
 *
 * - Kontakt-Datenbank
 * - Suche
 * - Ergebnisliste
 * - Profilseite
 * - vCard-Erstellung
 * - Kontakt speichern
 *
 * Sie funktioniert automatisch auf:
 *
 * - index.html
 * - person.html
 *
 * Es werden KEINE weiteren JavaScript-Dateien benötigt.
 *
 * =========================================================
 */


/* =========================================================
   KONTAKTDATEN
   ========================================================= */

const contacts = [

    {
        id: 1,
        name: "Bennet Grabherr",
        job: "CEO",
        company: "Grabherr Holding",
        email: "",
        phone: "+49 123456",
        website: "0176 60347283"
    },

    {
        id: 2,
        name: "Anne Grabherr",
        job: "",
        company: "",
        email: "",
        phone: "01736897078",
        website: ""
    }

];


/* =========================================================
   HILFSFUNKTIONEN
   ========================================================= */


/*
 * HTML sicher machen
 */

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/*
 * Text für Suche normalisieren
 */

function normalize(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase();
}


/*
 * vCard-Zeichen escapen
 */

function escapeVCard(value) {

    return String(value ?? "")

        .replace(/\\/g, "\\\\")

        .replace(/\r\n/g, "\\n")

        .replace(/\n/g, "\\n")

        .replace(/\r/g, "\\n")

        .replace(/;/g, "\\;")

        .replace(/,/g, "\\,");
}


/*
 * Sicheren Dateinamen erzeugen
 */

function safeFileName(value) {

    const cleaned = String(value ?? "")

        .replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            ""
        )

        .trim()

        .replace(/\s+/g, " ");


    return cleaned || "Kontakt";
}


/*
 * Initialen erzeugen
 */

function getInitials(name) {

    const clean =
        String(name ?? "")
            .trim()
            .replace(/\s+/g, " ");


    if (!clean) {

        return "CF";
    }


    const parts =
        clean.split(" ");


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}


/* =========================================================
   SUCHSEITE
   ========================================================= */

function initializeSearch() {

    const search =
        document.getElementById("search");

    const results =
        document.getElementById("results");

    const resultCount =
        document.getElementById("resultCount");


    /*
     * Wenn die Elemente nicht existieren,
     * sind wir nicht auf der Suchseite.
     */

    if (!search || !results) {

        return;
    }


    /*
     * -----------------------------------------------------
     * ERGEBNISSE ANZEIGEN
     * -----------------------------------------------------
     */

    function renderResults(list) {

        results.innerHTML = "";


        /*
         * Anzahl
         */

        if (resultCount) {

            resultCount.textContent =
                `${list.length} ${
                    list.length === 1
                        ? "Kontakt"
                        : "Kontakte"
                }`;
        }


        /*
         * Keine Ergebnisse
         */

        if (list.length === 0) {

            results.innerHTML = `

                <div class="empty-state">

                    <div
                        class="empty-icon"
                        aria-hidden="true"
                    >

                        <svg viewBox="0 0 24 24">

                            <circle
                                cx="11"
                                cy="11"
                                r="6.5"
                            ></circle>

                            <line
                                x1="16"
                                y1="16"
                                x2="21"
                                y2="21"
                            ></line>

                        </svg>

                    </div>


                    <h3>
                        Keine Kontakte gefunden
                    </h3>


                    <p>
                        Versuchen Sie einen anderen
                        Suchbegriff.
                    </p>

                </div>

            `;

            return;
        }


        /*
         * Kontakte
         */

        list.forEach(contact => {

            const card =
                document.createElement("div");


            card.className =
                "result-card";


            const company =
                contact.company
                    ? escapeHTML(contact.company)
                    : "Keine Firma angegeben";


            card.innerHTML = `

                <div>

                    <div class="result-card-name">

                        ${escapeHTML(contact.name)}

                    </div>


                    <div class="result-card-info">

                        ${company}

                    </div>

                </div>


                <a

                    class="result-card-arrow"

                    href="person.html?id=${encodeURIComponent(contact.id)}"

                    aria-label="Profil von ${escapeHTML(contact.name)} öffnen"

                >

                    →

                </a>

            `;


            results.appendChild(card);

        });

    }


    /*
     * -----------------------------------------------------
     * SUCHEN
     * -----------------------------------------------------
     */

    function searchContacts() {

        const value =
            normalize(search.value);


        /*
         * Leer:
         * alle Kontakte
         */

        if (!value) {

            renderResults(contacts);

            return;
        }


        /*
         * Suchfelder
         */

        const filtered =
            contacts.filter(contact => {

                const searchable = [

                    contact.name,

                    contact.job,

                    contact.company,

                    contact.email,

                    contact.phone,

                    contact.website

                ]
                    .filter(Boolean)
                    .join(" ");


                return normalize(searchable)
                    .includes(value);

            });


        renderResults(filtered);
    }


    /*
     * Suche überwachen
     */

    search.addEventListener(
        "input",
        searchContacts
    );


    /*
     * Tastatur:
     * CMD/CTRL + K
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                search.focus();

                search.select();
            }

        }
    );


    /*
     * Startanzeige
     */

    renderResults(contacts);
}


/* =========================================================
   PROFILSEITE
   ========================================================= */

function initializeProfile() {

    const profile =
        document.getElementById("profile");


    /*
     * Kein Profil-Container:
     * nicht person.html
     */

    if (!profile) {

        return;
    }


    /*
     * ID aus URL
     */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    /*
     * Kontakt suchen
     */

    const contact =
        contacts.find(
            item =>
                String(item.id) === String(id)
        );


    /*
     * Kontakt nicht gefunden
     */

    if (!contact) {

        profile.innerHTML = `

            <div class="card">

                <h2>
                    Person nicht gefunden
                </h2>

                <p>
                    Dieser Kontakt existiert nicht
                    oder wurde entfernt.
                </p>

            </div>

        `;

        return;
    }


    /*
     * -----------------------------------------------------
     * INFORMATIONEN
     * -----------------------------------------------------
     */

    const companyHTML =
        contact.company
            ? `

                <div class="profile-info-row">

                    <span class="profile-info-label">
                        Unternehmen
                    </span>

                    <span class="profile-info-value">
                        ${escapeHTML(contact.company)}
                    </span>

                </div>

            `
            : "";


    const jobHTML =
        contact.job
            ? `

                <div class="profile-info-row">

                    <span class="profile-info-label">
                        Position
                    </span>

                    <span class="profile-info-value">
                        ${escapeHTML(contact.job)}
                    </span>

                </div>

            `
            : "";


    const emailHTML =
        contact.email
            ? `

                <div class="profile-info-row">

                    <span class="profile-info-label">
                        E-Mail
                    </span>

                    <a
                        class="profile-info-value profile-link"
                        href="mailto:${escapeHTML(contact.email)}"
                    >
                        ${escapeHTML(contact.email)}
                    </a>

                </div>

            `
            : "";


    const phoneHTML =
        contact.phone
            ? `

                <div class="profile-info-row">

                    <span class="profile-info-label">
                        Telefon
                    </span>

                    <a
                        class="profile-info-value profile-link"
                        href="tel:${escapeHTML(contact.phone)}"
                    >
                        ${escapeHTML(contact.phone)}
                    </a>

                </div>

            `
            : "";


    const websiteHTML =
        contact.website
            ? `

                <div class="profile-info-row">

                    <span class="profile-info-label">
                        Website
                    </span>

                    <a
                        class="profile-info-value profile-link"
                        href="${escapeHTML(contact.website)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${escapeHTML(contact.website)}
                    </a>

                </div>

            `
            : "";


    /*
     * -----------------------------------------------------
     * PROFIL RENDERN
     * -----------------------------------------------------
     */

    profile.innerHTML = `

        <div class="card">


            <!-- IDENTITÄT -->

            <div class="profile-identity">


                <div class="profile-avatar">

                    ${escapeHTML(
                        getInitials(contact.name)
                    )}

                </div>


                <div class="profile-heading">

                    <h1>

                        ${escapeHTML(contact.name)}

                    </h1>


                    ${
                        contact.job
                            ? `
                                <h3>
                                    ${escapeHTML(contact.job)}
                                </h3>
                            `
                            : ""
                    }

                </div>


            </div>


            <!-- INFORMATIONEN -->

            <div class="profile-information">

                ${companyHTML}

                ${jobHTML}

                ${emailHTML}

                ${phoneHTML}

                ${websiteHTML}

            </div>


            <!-- SPEICHERN -->

            <div class="profile-actions">

                <button
                    id="saveContactButton"
                    class="save-contact-button"
                    type="button"
                >

                    <span
                        class="save-contact-icon"
                        aria-hidden="true"
                    >

                        <svg viewBox="0 0 24 24">

                            <path
                                d="M5 3h11l3 3v15H5z"
                            ></path>

                            <path
                                d="M8 3v6h8V3"
                            ></path>

                            <circle
                                cx="12"
                                cy="16"
                                r="2.5"
                            ></circle>

                        </svg>

                    </span>


                    <span>
                        KONTAKT SPEICHERN
                    </span>

                </button>


                <div
                    id="saveContactStatus"
                    class="save-contact-status"
                    aria-live="polite"
                ></div>

            </div>


        </div>

    `;


    /*
     * -----------------------------------------------------
     * BUTTON VERBINDEN
     * -----------------------------------------------------
     */

    const button =
        document.getElementById(
            "saveContactButton"
        );


    if (button) {

        button.addEventListener(
            "click",
            () => {

                saveContact(
                    contact,
                    button
                );

            }
        );

    }

}


/* =========================================================
   KONTAKT SPEICHERN
   ========================================================= */

function saveContact(
    contact,
    button
) {

    if (!contact) {

        return;
    }


    /*
     * -----------------------------------------------------
     * vCARD ERSTELLEN
     * -----------------------------------------------------
     */

    const lines = [

        "BEGIN:VCARD",

        "VERSION:3.0",

        `N:${escapeVCard(contact.name)};;;;`,

        `FN:${escapeVCard(contact.name)}`

    ];


    if (contact.company) {

        lines.push(
            `ORG:${escapeVCard(contact.company)}`
        );

    }


    if (contact.job) {

        lines.push(
            `TITLE:${escapeVCard(contact.job)}`
        );

    }


    if (contact.phone) {

        lines.push(
            `TEL;TYPE=CELL:${escapeVCard(contact.phone)}`
        );

    }


    if (contact.email) {

        lines.push(
            `EMAIL:${escapeVCard(contact.email)}`
        );

    }


    if (contact.website) {

        lines.push(
            `URL:${escapeVCard(contact.website)}`
        );

    }


    lines.push("END:VCARD");


    const vcard =
        lines.join("\r\n");


    /*
     * -----------------------------------------------------
     * DATEI ERSTELLEN
     * -----------------------------------------------------
     */

    const blob =
        new Blob(
            [vcard],
            {
                type:
                    "text/vcard;charset=utf-8"
            }
        );


    /*
     * Temporäre Browser-URL
     */

    const url =
        URL.createObjectURL(blob);


    /*
     * Download-Link
     */

    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        `${safeFileName(contact.name)}.vcf`;


    link.style.display =
        "none";


    document.body.appendChild(link);


    /*
     * Download starten
     */

    link.click();


    /*
     * Link entfernen
     */

    document.body.removeChild(link);


    /*
     * URL später freigeben
     */

    setTimeout(
        () => {

            URL.revokeObjectURL(url);

        },
        1000
    );


    /*
     * -----------------------------------------------------
     * FEEDBACK
     * -----------------------------------------------------
     */

    if (button) {

        button.classList.add("saved");


        const text =
            button.querySelector(
                "span:last-child"
            );


        if (text) {

            text.textContent =
                "KONTAKT ERSTELLT";
        }

    }


    const status =
        document.getElementById(
            "saveContactStatus"
        );


    if (status) {

        status.textContent =
            "Die Kontaktdatei wurde erstellt.";

        status.classList.add(
            "visible"
        );

    }


    /*
     * Button nach einigen Sekunden
     * zurücksetzen
     */

    setTimeout(
        () => {

            if (button) {

                button.classList.remove(
                    "saved"
                );


                const text =
                    button.querySelector(
                        "span:last-child"
                    );


                if (text) {

                    text.textContent =
                        "KONTAKT SPEICHERN";
                }

            }

        },
        3000
    );

}


/* =========================================================
   APP START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeSearch();

        initializeProfile();

    }
);