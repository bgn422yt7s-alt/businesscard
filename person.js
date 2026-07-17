const contacts = [

{
id:1,
name:"Max Muster",
job:"Geschaeftsfuehrer",
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

<p>Unternehmen: ${contact.company}</p>

<p>Mail: ${contact.email}</p>

<p>Telefon: ${contact.phone}</p>

<p>Website: ${contact.website}</p>


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
`BEGIN:VCARD\r\n
VERSION:3.0\r\n
CHARSET=UTF-8\r\n
N:${contact.name};;;;\r\n
FN:${contact.name}\r\n
ORG:${contact.company}\r\n
TITLE:${contact.job}\r\n
TEL;TYPE=CELL:${contact.phone}\r\n
EMAIL:${contact.email}\r\n
URL:${contact.website}\r\n
END:VCARD`;



const blob = new Blob(
    [vcard],
    {
        type:"text/vcard;charset=utf-8"
    }
);


const url =
URL.createObjectURL(blob);


const link =
document.createElement("a");


link.href=url;

link.download =
contact.name + ".vcf";


document.body.appendChild(link);

link.click();

document.body.removeChild(link);


URL.revokeObjectURL(url);

}