const contacts = [
    {
        name: "Max Mustermann",
        job: "Geschäftsführer",
        company: "Muster GmbH",
        email: "max@muster.de",
        phone: "+49 123456",
        website: "https://muster.de"
    },
    {
        name: "Anna Beispiel",
        job: "Marketing Managerin",
        company: "Beispiel AG",
        email: "anna@beispiel.de",
        phone: "+49 987654",
        website: "https://beispiel.de"
    },
    {
        name: "Peter Schmidt",
        job: "IT Berater",
        company: "Schmidt Solutions",
        email: "peter@schmidt.de",
        phone: "+49 555222",
        website: "https://schmidt.de"
    }
];


const searchInput = document.getElementById("search");
const results = document.getElementById("results");


// Kontakt als Handy-Kontakt speichern
function saveContact(index) {

    const contact = contacts[index];


    const vcard = 
`BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
ORG:${contact.company}
TITLE:${contact.job}
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.website}
END:VCARD`;


    const blob = new Blob(
        [vcard],
        { type: "text/vcard" }
    );


    const url = URL.createObjectURL(blob);


    const link = document.createElement("a");

    link.href = url;

    link.download = contact.name + ".vcf";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);
}



function showContacts(contactList) {

    results.innerHTML = "";


    if (contactList.length === 0) {

        results.innerHTML =
        "<p>Keine Kontakte gefunden</p>";

        return;
    }


    contactList.forEach(contact => {


        const index = contacts.indexOf(contact);


        results.innerHTML += `

        <div class="card">

            <h2>${contact.name}</h2>

            <p>${contact.job}</p>

            <p>🏢 ${contact.company}</p>

            <p>📧 ${contact.email}</p>

            <p>📞 ${contact.phone}</p>

            <p>🌐 ${contact.website}</p>


            <button onclick="saveContact(${index})">

                Kontakt speichern

            </button>


        </div>

        `;

    });

}



searchInput.addEventListener("input", function() {


    const searchText =
    searchInput.value.toLowerCase().trim();


    const filtered =
    contacts.filter(contact =>

        contact.name.toLowerCase().includes(searchText) ||

        contact.company.toLowerCase().includes(searchText) ||

        contact.job.toLowerCase().includes(searchText)

    );


    showContacts(filtered);

});


// Kontakte beim Start anzeigen
showContacts(contacts);
