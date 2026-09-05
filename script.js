/*
 * =========================================================
 * CONTACTFINDER
 * ZENTRALE APP-DATEI
 * =========================================================
 *
 * Diese eine Datei übernimmt:
 *
 * 1. Zentrale Kontaktdatenbank
 * 2. Kontaktsuche
 * 3. Suchergebnisse
 * 4. Kontaktprofil
 * 5. vCard-Erstellung
 * 6. Kontakt speichern
 * 7. Sicherheitsbereinigung von HTML- und vCard-Daten
 *
 * Die Datei erkennt automatisch, ob sie auf:
 *
 *     index.html
 *
 * oder
 *
 *     person.html
 *
 * ausgeführt wird.
 *
 * Dadurch kann dieselbe Datei auf beiden Seiten verwendet
 * werden, ohne dass null-Element- oder doppelte
 * Funktionsfehler entstehen.
 *
 * =========================================================
 */


/* =========================================================
   1. ZENTRALE KONTAKT-DATENBANK
   ========================================================= */

const contacts = [
    {
        id: 1,
        name: "Max Mustermann",
        job: "Geschäftsführer",
        company: "Muster GmbH",
        email: "max@muster.de",
        phone: "+49 123456",
        website: "https://muster.de"
    },

    {
        id: 2,
        name: "Anna Beispiel",
        job: "Marketing Managerin",
        company: "Beispiel AG",
        email: "anna@beispiel.de",
        phone: "+49 987654",
        website: "https://beispiel.de"
    },

    {
        id: 3,
        name: "Anne",
        job: "",
        company: "",
        email: "",
        phone: "",
        website: ""
    }
];


/* =========================================================
   2. HILFSFUNKTIONEN
   ========================================================= */


/*
 * ---------------------------------------------------------
 * HTML SICHERHEIT
 * ---------------------------------------------------------
 *
 * Verhindert, dass Kontaktinformationen als HTML
 * interpretiert werden.
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
 * ---------------------------------------------------------
 * vCARD SICHERHEIT
 * ---------------------------------------------------------
 *
 * Sonderzeichen werden für das vCard-Format korrekt
 * escaped.
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
 * ---------------------------------------------------------
 * DATEINAME BEREINIGEN
 * ---------------------------------------------------------
 *
 * Verhindert problematische Zeichen im Namen der
 * heruntergeladenen .vcf-Datei.
 */

function safeFileName(value) {

    return String(value ?? "Kontakt")
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .trim()
        .replace(/\s+/g, " ")
        || "Kontakt";
}


/*
 * ---------------------------------------------------------
 * TEXT NORMALISIEREN
 * ---------------------------------------------------------
 */

function normalizeSearchValue(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase();
}


/* =========================================================
   3. SUCHSEITE
   ========================================================= */


/*
 * Die Elemente werden bewusst erst hier gesucht.
 *
 * Dadurch gibt es KEINEN Fehler auf person.html,
 * obwohl dort kein Suchfeld existiert.
 */

function initializeSearchPage() {

    const search = document.getElementById("search");
    const results = document.getElementById("results");
    const resultCount = document.getElementById("resultCount");


    /*
     * Wenn die benötigten Elemente nicht existieren,
     * handelt es sich nicht um die Suchseite.
     *
     * Funktion einfach beenden.
     */

    if (!search || !results) {
        return;
    }


    /*
     * -----------------------------------------------------
     * KONTAKTE ANZEIGEN
     * -----------------------------------------------------
     */

    function showContacts(list) {

        results.innerHTML = "";


        /*
         * Ergebnisanzahl aktualisieren
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
         * -------------------------------------------------
         * KEINE ERGEBNISSE
         * -------------------------------------------------
         */

        if (list.length === 0) {

            results.innerHTML = `
                <div class="empty-state">

                    <div
                        class="empty-icon"
                        aria-hidden="true"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            role="img"
                        >
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
         * -------------------------------------------------
         * ERGEBNISSE
         * -------------------------------------------------
         */

        list.forEach(contact => {

            const card =
                document.createElement("div");

            card.className = "result-card";


            /*
             * Unternehmensanzeige
             */

            const companyText =
                contact.company
                    ? escapeHTML(contact.company)
                    : "Keine Firma angegeben";


            card.innerHTML = `

                <div>

                    <div class="result-card-name">
                        ${escapeHTML(contact.name)}
                    </div>

                    <div class="result-card-info">
                        ${companyText}
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
     * SUCHFUNKTION
     * -----------------------------------------------------
     */

    function performSearch() {

        const value =
            normalizeSearchValue(search.value);


        /*
         * Leeres Suchfeld:
         * alle Kontakte anzeigen.
         */

        if (value === "") {

            showContacts(contacts);

            return;
        }


        /*
         * Kontakte durchsuchen.
         *
         * Durchsucht:
         *
         * Name
         * Position
         * Unternehmen
         * E-Mail
         * Telefon
         * Website
         */

        const filtered =
            contacts.filter(contact => {

                const searchableText = [

                    contact.name,
                    contact.job,
                    contact.company,
                    contact.email,
                    contact.phone,
                    contact.website

                ]
                .filter(Boolean)
                .join(" ");


                return normalizeSearchValue(
                    searchableText
                ).includes(value);
            });


        showContacts(filtered);
    }


    /*
     * -----------------------------------------------------
     * EVENT LISTENER
     * -----------------------------------------------------
     */

    search.addEventListener(
        "input",
        performSearch
    );


    /*
     * -----------------------------------------------------
     * INITIALE ANZEIGE
     * -----------------------------------------------------
     */

    showContacts(contacts);
}


/* =========================================================
   4. PROFILSEITE
   ========================================================= */


/*
 * ---------------------------------------------------------
 * PROFIL INITIALISIEREN
 * ---------------------------------------------------------
 */

function initializeProfilePage() {

    const profile =
        document.getElementById("profile");


    /*
     * Wenn kein Profil-Container existiert,
     * sind wir nicht auf person.html.
     */

    if (!profile) {
        return;
    }


    /*
     * -----------------------------------------------------
     * ID AUS URL LESEN
     * -----------------------------------------------------
     */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");


    /*
     * -----------------------------------------------------
     * KONTAKT SUCHEN
     * -----------------------------------------------------
     */

    const contact =
        contacts.find(
            person =>
                String(person.id) === String(id)
        );


    /*
     * -----------------------------------------------------
     * KONTAKT NICHT GEFUNDEN
     * -----------------------------------------------------
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
     * PROFIL AUFBAUEN
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


            <div class="profile-information">

                ${companyHTML}
                ${jobHTML}
                ${emailHTML}
                ${phoneHTML}
                ${websiteHTML}

            </div>


            <div class="profile-actions">

                <button
                    id="saveContactButton"
                    class="save-contact-button"
                    type="button"
                    aria-label="Kontakt ${escapeHTML(contact.name)} speichern"
                >

                    <span
                        class="save-contact-icon"
                        aria-hidden="true"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            role="img"
                        >
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
     * SPEICHER-BUTTON AKTIVIEREN
     * -----------------------------------------------------
     */

    const saveButton =
        document.getElementById(
            "saveContactButton"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            () => saveContact(contact)
        );
    }
}


/* =========================================================
   5. INITIALEN ERZEUGEN
   ========================================================= */


/*
 * Beispiel:
 *
 * "Max Mustermann"
 *
 * ergibt:
 *
 * "MM"
 */

function getInitials(name) {

    const cleanName =
        String(name ?? "")
            .trim()
            .replace(/\s+/g, " ");


    if (!cleanName) {
        return "CF";
    }


    const parts =
        cleanName.split(" ");


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
   6. KONTAKT SPEICHERN
   ========================================================= */


/*
 * ---------------------------------------------------------
 * vCard erstellen und speichern
 * ---------------------------------------------------------
 *
 * Die vCard kann anschließend auf Geräten wie iPhone,
 * iPad oder Mac geöffnet und in Kontakte übernommen
 * werden.
 */

function saveContact(contact) {

    if (!contact) {
        return;
    }


    /*
     * -----------------------------------------------------
     * vCARD
     * -----------------------------------------------------
     */

    const vcard = [

        "BEGIN:VCARD",

        "VERSION:3.0",

        `N:${escapeVCard(contact.name)};;;;`,

        `FN:${escapeVCard(contact.name)}`,

        contact.company
            ? `ORG:${escapeVCard(contact.company)}`
            : "",

        contact.job
            ? `TITLE:${escapeVCard(contact.job)}`
            : "",

        contact.phone
            ? `TEL;TYPE=CELL:${escapeVCard(contact.phone)}`
            : "",

        contact.email
            ? `EMAIL:${escapeVCard(contact.email)}`
            : "",

        contact.website
            ? `URL:${escapeVCard(contact.website)}`
            : "",

        "END:VCARD"

    ]
    .filter(Boolean)
    .join("\r\n");


    /*
     * -----------------------------------------------------
     * BLOB
     * -----------------------------------------------------
     */

    const blob =
        new Blob(
            [vcard],
            {
                type: "text/vcard;charset=utf-8"
            }
        );


    /*
     * -----------------------------------------------------
     * TEMPORÄRE URL
     * -----------------------------------------------------
     */

    const url =
        URL.createObjectURL(blob);


    /*
     * -----------------------------------------------------
     * DOWNLOAD-LINK
     * -----------------------------------------------------
     */

    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        `${safeFileName(contact.name)}.vcf`;


    /*
     * Link in DOM einfügen.
     *
     * Das erhöht die Kompatibilität mit verschiedenen
     * Browsern und mobilen Geräten.
     */

    link.style.display = "none";

    document.body.appendChild(link);


    /*
     * Download auslösen.
     */

    link.click();


    /*
     * Link wieder entfernen.
     */

    document.body.removeChild(link);


    /*
     * Object URL später freigeben.
     */

    setTimeout(() => {

        URL.revokeObjectURL(url);

    }, 1000);


    /*
     * -----------------------------------------------------
     * VISUELLES FEEDBACK
     * -----------------------------------------------------
     */

    const button =
        document.getElementById(
            "saveContactButton"
        );


    const status =
        document.getElementById(
            "saveContactStatus"
        );


    if (button) {

        button.classList.add(
            "saved"
        );

        const originalText =
            button.querySelector(
                "span:last-child"
            );


        if (originalText) {

            originalText.textContent =
                "KONTAKT ERSTELLT";
        }
    }


    if (status) {

        status.textContent =
            "Die Kontaktdatei wurde erstellt.";

        status.classList.add(
            "visible"
        );
    }


    /*
     * Nach kurzer Zeit Button wieder auf
     * normalen Zustand zurücksetzen.
     */

    setTimeout(() => {

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

    }, 3000);
}


/* =========================================================
   7. APP STARTEN
   ========================================================= */


/*
 * DOMContentLoaded sorgt dafür, dass alle HTML-Elemente
 * bereits vorhanden sind, bevor die App darauf zugreift.
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Suchseite initialisieren.
         *
         * Wenn #search nicht existiert,
         * passiert einfach nichts.
         */

        initializeSearchPage();


        /*
         * Profilseite initialisieren.
         *
         * Wenn #profile nicht existiert,
         * passiert einfach nichts.
         */

        initializeProfilePage();

    }
);