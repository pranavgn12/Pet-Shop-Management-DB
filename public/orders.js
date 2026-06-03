function loadOrders() {
    fetch("/all-orders")
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#ordersTable tbody");
            tbody.innerHTML = "";

            if (data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3">No orders found</td>
                    </tr>`;
                return;
            }

            // Group by order_id
            const grouped = {};
            data.forEach(r => {
                if (!grouped[r.order_id]) {
                    grouped[r.order_id] = [];
                }
                grouped[r.order_id].push(r);
            });

            // Build rows with rowspan
            Object.keys(grouped).forEach(orderId => {
                const items = grouped[orderId];

                items.forEach((item, index) => {
                    const tr = document.createElement("tr");

                    if (index === 0) {
                        const tdOrder = document.createElement("td");
                        tdOrder.rowSpan = items.length;
                        tdOrder.innerText = orderId;
                        tr.appendChild(tdOrder);
                    }

                    const tdPetId = document.createElement("td");
                    tdPetId.innerText = item.pet_id || "";
                    tr.appendChild(tdPetId);

                    const tdPetName = document.createElement("td");
                    tdPetName.innerText = item.pet_name || "";
                    tr.appendChild(tdPetName);

                    tbody.appendChild(tr);
                });
            });
        })
        .catch(err => {
            console.error(err);
            alert("Failed to load orders");
        });
}


function deleteOrder() {
    const orderId = document.getElementById("order_id").value;

    if (!orderId) {
        alert("Order ID is required");
        return;
    }

    if (!confirm("Delete this order and all its items?")) return;

    fetch("/delete-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId })
    })
    .then(() => loadOrders());
}

loadOrders();
