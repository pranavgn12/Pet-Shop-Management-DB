fetch("/pets")
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("pets");
        data.forEach(p => {
            list.innerHTML += `<li>${p.name} - ${p.species} - ${p.price}</li>`;
        });
    });
