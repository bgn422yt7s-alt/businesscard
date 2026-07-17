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


const search =
document.getElementById("search");

const results =
document.getElementById("results");


function showContacts(list){


results.innerHTML="";


list.forEach(contact=>{


results.innerHTML += `

<div class="card">

<h2>
${contact.name}
</h2>

<p>
${contact.company}
</p>


<a href="person.html?id=${contact.id}">
Profil öffnen
</a>


</div>

`;

});


}



search.addEventListener(
"input",
()=>{


let value =
search.value.toLowerCase();


let filtered =
contacts.filter(contact=>

contact.name
.toLowerCase()
.includes(value)

);


showContacts(filtered);


});


showContacts(contacts);
