function loadCustomers() {
    fetch("/all-customers")
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#customersTable tbody");
            tbody.innerHTML = "";

            if (data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6">No customers found</td>
                    </tr>`;
                return;
            }

            data.forEach(c => {
                tbody.innerHTML += `
                    <tr>
                        <td>${c.customer_id}</td>
                        <td>${c.full_name}</td>
                        <td>${c.phone || ""}</td>
                        <td>${c.email || ""}</td>
                        <td>${c.address || ""}</td>
                        <td>${c.created_at}</td>
                    </tr>
                `;
            });
        });
}

function deleteCustomer() {
    const customerId = document.getElementById("customer_id").value;

    if (!customerId) {
        alert("Customer ID is required");
        return;
    }

    if (!confirm("Delete this customer? Pets will be unlinked.")) return;

    fetch("/delete-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId })
    })
    .then(() => loadCustomers());
}

loadCustomers();
