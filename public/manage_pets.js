function loadPets() {
    fetch("/all-pets")
        .then(res => res.json())
        .then(data => {
            const box = document.getElementById("petList");
            box.innerHTML = `
<table border="1" cellspacing="0" cellpadding="6">
    <thead>
        <tr>
            <th>Pet ID</th>
            <th>Name</th>
            <th>Species</th>
            <th>Breed</th>
            <th>Gender</th>
            <th>Color</th>
            <th>Age (months)</th>
            <th>Price</th>
            <th>Arrival Date</th>
            <th>Health Notes</th>
            <th>Status</th>
            <th>Customer ID</th>
            <th>Supplier ID</th>
        </tr>
    </thead>
    <tbody id="petTableBody"></tbody>
</table>
`;

const tbody = document.getElementById("petTableBody");

data.forEach(p => {
    tbody.innerHTML += `
        <tr>
            <td>${p.pet_id}</td>
            <td>${p.name ?? ""}</td>
            <td>${p.species}</td>
            <td>${p.breed ?? ""}</td>
            <td>${p.gender ?? ""}</td>
            <td>${p.color ?? ""}</td>
            <td>${p.age_months ?? ""}</td>
            <td>${p.price ?? ""}</td>
            <td>${p.arrival_date ?? ""}</td>
            <td>${p.health_notes ?? ""}</td>
            <td>${p.status ?? ""}</td>
            <td>${p.customer_id ?? ""}</td>
            <td>${p.supplier_id ?? ""}</td>
        </tr>
    `;
});

        });
}

function savePet() {
    const petIdEl = document.getElementById("pet_id");
    const nameEl = document.getElementById("name");
    const speciesEl = document.getElementById("species");
    const breedEl = document.getElementById("breed");
    const genderEl = document.getElementById("gender");
    const colourEl = document.getElementById("color");
    const ageEl = document.getElementById("age");
    const arrival_dateEl = document.getElementById("arrival_date");
    const health_notesEl = document.getElementById("health_notes");
    const statusE1 = document.getElementById("status");
    const priceEl = document.getElementById("price");
    const customer_idE1 = document.getElementById("customer_id")
    const supplierEl = document.getElementById("supplier");
    if (!petIdEl.value) {
        alert("Pet ID is required");
        return;
    }

    fetch("/save-pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            pet_id: petIdEl.value,
            name: nameEl.value,
            species: speciesEl.value,
            gender: genderEl.value,
            breed: breedEl.value,
            colour: colourEl.value,
            age: ageEl.value,
            arrival_date: arrival_dateEl.value,
            health_notes: health_notesEl.value,
            status: statusE1.value,
            customer_id: customer_idE1.value,
            supplier: supplierEl.value
        })
    }).then(() => loadPets());
}

function deletePet() {
    if (!pet_id.value) {
        alert("Pet ID is required");
        return;
    }

    fetch("/delete-pet", {
        method: "POST",
        body: JSON.stringify({ pet_id: pet_id.value })
    }).then(() => loadPets());
}

loadPets();
