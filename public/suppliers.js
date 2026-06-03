function loadSuppliers() {
    fetch("/all-suppliers")
        .then(res => res.json())
        .then(data => {
            const table = document.getElementById("supplierTable");
            const header = table.rows[0].outerHTML;
            table.innerHTML = header;

            data.forEach(s => {
                table.innerHTML += `
                    <tr>
                        <td>${s.supplier_id}</td>
                        <td>${s.name}</td>
                        <td>${s.contact_person || ""}</td>
                        <td>${s.phone || ""}</td>
                        <td>${s.email || ""}</td>
                        <td>${s.address || ""}</td>
                    </tr>
                `;
            });
        });
}

function saveSupplier() {
    if (!supplier_id.value) {
        alert("Supplier ID is required");
        return;
    }

    fetch("/save-supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            supplier_id: supplier_id.value,
            name: name1.value,
            contact_person: contact_person.value,
            phone: phone.value,
            email: email.value,
            address: address.value
        })
    }).then(() => loadSuppliers());
}

function deleteSupplier() {
    if (!supplier_id.value) {
        alert("Supplier ID is required");
        return;
    }

    fetch("/delete-supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier_id: supplier_id.value })
    }).then(() => loadSuppliers());
}

loadSuppliers();
