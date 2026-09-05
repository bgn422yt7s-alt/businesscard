/*
 * =========================================================
 * CONTACTFINDER
 * Zentrale Kontakt-Datenbank
 * =========================================================
 */
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
/*
 * =========================================================
 * CONTACTFINDER
 * Suchfunktion
 * =========================================================
 */
const search = document.getElementById("search");
const results = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
/*
 * ---------------------------------------------------------
 * Kontakte anzeigen
 * ---------------------------------------------------------
 */
function showContacts(list) {
    results.innerHTML = "";
    if (resultCount) {
        resultCount.textContent =
            `${list.length} ${list.length === 1 ? "Kontakt" : "Kontakte"}`;
    }
    // Keine Ergebnisse
    if (list.length === 0) {
        results.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="11" cy="11" r="6.5"></circle>
                        <line x1="16" y1="16" x2="21" y2="21"></line>
                    </svg>
                </div>
                <h3>Keine Kontakte gefunden</h3>
                <p>
                    Versuchen Sie einen anderen Suchbegriff.
                </p>
            </div>
        `;
        return;
    }
    // Ergebnisse
    list.forEach(contact => {
        const card = document.createElement("div");
        card.className = "result-card";
        card.innerHTML = `
            <div>
                <div class="result-card-name">
                    ${escapeHTML(contact.name)}
                </div>
                <div class="result-card-info">
                    ${escapeHTML(contact.company || "Keine Firma angegeben")}
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
 * ---------------------------------------------------------
 * Suche
 * ---------------------------------------------------------
 */
search.addEventListener("input", () => {
    const value =
        search.value
            .trim()
            .toLowerCase();
    if (value === "") {
        showContacts(contacts);
        return;
    }
    const filtered =
        contacts.filter(contact => {
            const searchableText = [
                contact.name,
                contact.job,
                contact.company,
                contact.email,
                contact.phone
            ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
            return searchableText.includes(value);
        });
    showContacts(filtered);
});
/*
 * ---------------------------------------------------------
 * Sicherheit
 * ---------------------------------------------------------
 *
 * Verhindert, dass eingegebene Kontaktinformationen
 * direkt als HTML interpretiert werden.
 */
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/*
 * ---------------------------------------------------------
 * Initiale Anzeige
 * ---------------------------------------------------------
 */
showContacts(contacts);
/*
 * =========================================================
 * CONTACTFINDER
 * Profilseite
 * =========================================================
 */
/*
 * ---------------------------------------------------------
 * ID aus URL lesen
 * ---------------------------------------------------------
 */
const params =
    new URLSearchParams(window.location.search);
const id =
    params.get("id");
/*
 * ---------------------------------------------------------
 * Kontakt finden
 * ---------------------------------------------------------
 */
const contact =
    contacts.find(
        person => String(person.id) === String(id)
    );
/*
 * ---------------------------------------------------------
 * Profil-Element
 * ---------------------------------------------------------
 */
const profile =
    document.getElementById("profile");
/*
 * ---------------------------------------------------------
 * Profil anzeigen
 * ---------------------------------------------------------
 */
if (contact) {
    profile.innerHTML = `
        <div class="card">
            <h1>
                ${escapeHTML(contact.name)}
            </h1>
            ${
                contact.job
                ? `<h3>${escapeHTML(contact.job)}</h3>`
                : ""
            }
            ${
                contact.company
                ? `<p>
                    Unternehmen:
                    ${escapeHTML(contact.company)}
                </p>`
                : ""
            }
            ${
                contact.email
                ? `<p>
                    Mail:
                    <a href="mailto:${escapeHTML(contact.email)}">
                        ${escapeHTML(contact.email)}
                    </a>
                </p>`
                : ""
            }
            ${
                contact.phone
                ? `<p>
                    Telefon:
                    <a href="tel:${escapeHTML(contact.phone)}">
                        ${escapeHTML(contact.phone)}
                    </a>
                </p>`
                : ""
            }
            ${
                contact.website
                ? `<p>
                    Website:
                    <a
                        href="${escapeHTML(contact.website)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${escapeHTML(contact.website)}
                    </a>
                </p>`
                : ""
            }
            <button
                type="button"
                onclick="saveContact()"
            >
                Kontakt speichern
            </button>
        </div>
    `;
} else {
    profile.innerHTML = `
        <div class="card">
            <h2>
                Person nicht gefunden
            </h2>
            <p>
                Dieser Kontakt existiert nicht oder
                wurde entfernt.
            </p>
        </div>
    `;
}
/*
 * ---------------------------------------------------------
 * Kontakt als vCard speichern
 * ---------------------------------------------------------
 */
function saveContact() {
    if (!contact) {
        return;
    }
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
    const blob =
        new Blob(
            [vcard],
            {
                type: "text/vcard;charset=utf-8"
            }
        );
    const url =
        URL.createObjectURL(blob);
    const link =
        document.createElement("a");
    link.href = url;
    link.download =
        `${contact.name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
}
/*
 * ---------------------------------------------------------
 * HTML-Sicherheit
 * ---------------------------------------------------------
 */
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/*
 * ---------------------------------------------------------
 * vCard-Sicherheit
 * ---------------------------------------------------------
 */
function escapeVCard(value) {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,");
}