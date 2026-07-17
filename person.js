const contacts = [

{
id:1,
name:"Max Mustermann",
job:"Geschäftsführer",
company:"Muster GmbH",
email:"max@muster.de",
phone:"+49 123456",
website:"https://muster.de"
},

{
id:2,
name:"Anna Beispiel",
job:"Marketing Managerin",
company:"Beispiel AG",
email:"anna@beispiel.de",
phone:"+49 987654",
website:"https://beispiel.de"
}

];



const params =
new URLSearchParams(
window.location.search
);


const id =
params.get("id");



const contact =
contacts.find(
person => person.id == id
);



const profile =
document.getElementById("profile");



if(contact){


profile.innerHTML = `

<div class="card">

<h1>${contact.name}</h1>

<h3>${contact.job}</h3>

<p>🏢 ${contact.company}</p>

<p>📧 ${contact.email}</p>

<p>📞 ${contact.phone}</p>

<p>🌐 ${contact.website}</p>


<button onclick="saveContact()">
Kontakt speichern
</button>


</div>

`;


}
else{

profile.innerHTML =
"<h2>Person nicht gefunden</h2>";

}




function saveContact(){


const vcard =
`
BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
ORG:${contact.company}
TITLE:${contact.job}
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.website}
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
contact.name+".vcf";


link.click();


}
