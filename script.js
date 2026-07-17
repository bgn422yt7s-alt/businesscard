const contacts = [

{
    name:"Max Mustermann",
    job:"Geschäftsführer",
    company:"Muster GmbH",
    email:"max@muster.de",
    phone:"+49 123456",
    website:"https://muster.de"
},

{
    name:"Anna Beispiel",
    job:"Marketing Managerin",
    company:"Beispiel AG",
    email:"anna@beispiel.de",
    phone:"+49 987654",
    website:"https://beispiel.de"
}

];


const search =
document.getElementById("search");


const results =
document.getElementById("results");



function showContacts(list){


    results.innerHTML="";


    list.forEach(contact=>{


        results.innerHTML += `

        <div class="card">

            <h2>${contact.name}</h2>

            <p>${contact.job}</p>

            <p>🏢 ${contact.company}</p>

            <p>📧 ${contact.email}</p>

            <p>📞 ${contact.phone}</p>

            <p>🌐 ${contact.website}</p>


            <button onclick="saveContact('${contact.name}',
            '${contact.phone}',
            '${contact.email}')">

            Kontakt speichern

            </button>

        </div>

        `;


    });


}



search.addEventListener(
"input",
()=>{


const value =
search.value.toLowerCase();


const filtered =
contacts.filter(contact=>

contact.name
.toLowerCase()
.includes(value)

);


showContacts(filtered);


});


function saveContact(
name,
phone,
email
){


const vcard = `

BEGIN:VCARD

VERSION:3.0

FN:${name}

TEL:${phone}

EMAIL:${email}

END:VCARD

`;


const file =
new Blob(
[vcard],
{type:"text/vcard"}
);


const url =
URL.createObjectURL(file);


const link =
document.createElement("a");


link.href=url;

link.download=
name+".vcf";


link.click();


}


// Startansicht

showContacts(contacts);
