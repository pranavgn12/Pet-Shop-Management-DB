// 1. Helper function to get values safely
const getVal = (id) => document.getElementById(id).value;
loadItems();

function saveCustomer() {
    fetch("/save-customer", {
        method: "POST",
        // 2. IMPORTANT: Add headers so the server knows it's JSON
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            // 3. Explicit selection prevents variable collision
            customer_id: getVal("customer_id"),
            full_name: getVal("full_name"),
            phone: getVal("phone"),
            email: getVal("email"),
            address: getVal("address"),
            created_at: getVal("created_at")
        })
    })
    .catch(err => console.error("Error saving:", err)); // 4. Add error handling
    document.getElementById("cust_id").innerText=getVal("customer_id");
    alert("Processed Successfully");
}


function saveOrder() {
    fetch("/save-order", {
        method: "POST",
        // 2. IMPORTANT: Add headers so the server knows it's JSON
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            // 3. Explicit selection prevents variable collision
            order_id: getVal("order_id"), 
            customer_id: getVal("customer_id"),
            order_date: getVal("order_date"),
            payment_method: getVal("payment_method")
        })
        
    })
    .catch(err => console.error("Error saving:", err)); // 4. Add error handling
    alert("Order processed");
    loadItems();
}


/*function loadPets() {
    fetch("/all-pets")
        .then(res => res.json())
        .then(data => {
            const box = document.getElementById("petList");
            box.innerHTML = `
<table border="1" cellspacing="0" cellpadding="6">
    <thead>
        <tr>
            <th>ID</th>
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
}*/




function proceed() {
    const orderId = getVal("order_id");
    const customerId = getVal("customer_id");

    if (!orderId) {
        alert("Order ID is required");
        return;
    }

    if (!customerId) {
        alert("Customer ID is required");
        return;
    }

    fetch(`/order-items?order_id=${orderId}`)
        .then(res => res.json())
        .then(items => {
            if (items.length === 0) {
                alert("Cannot proceed. No pets added to this order.");
                return;
            }

            fetch("/proceed-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    order_id: orderId,
                    customer_id: customerId
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Proceed failed");
                return res.text();
            })
            .then(() => {
                alert("Order completed successfully");

                window.location.reload();
               

            })
            .catch(err => {
                console.error(err);
                alert("Error completing order");
            });
        });
}





function addItem() {
    fetch("/add-order-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            order_id: getVal("order_id"),
            pet_id: getVal("pet_id"),
            price: getVal("price")
        })
    })
    .then(res => res.text())
    .then(t => {
        if (t === "NOT_AVAILABLE") {
            alert("Pet not available");
        } else {
            loadItems();
        }
    });
}

function loadTotal() {
    fetch(`/order-total?order_id=${order_id.value}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("total").innerText = data.total;
        });
}

function removeItem() {
    fetch("/remove-order-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            order_id: getVal("order_id"),
            pet_id: getVal("pet_id")
        })
    }).then(() => loadItems());
}

function loadItems() {
    const currentOrderId = getVal("order_id");
    if (!currentOrderId) return;
    fetch(`/order-items?order_id=${currentOrderId}`)
        .then(res => res.json())
        .then(data => {
           
            const table = document.getElementById("items");
            const emptyMsg = document.getElementById("empty"); // Select explicitly

            // Logic to keep the header row (assuming row 0 is header)
            // A better way is to target a <tbody>, but this fixes your current logic:
            const headerRow = table.rows[0].outerHTML;
            table.innerHTML = headerRow; 
            
            emptyMsg.innerText = "";


            if (data.length === 0) {
                emptyMsg.innerText = "No items in this order";
                return;
            }

            // Using map and join is often faster/cleaner than repeated innerHTML +=
            const rows = data.map(p => `
                <tr>
                    <td>${p.pet_id}</td>
                    <td>${p.name}</td>
                    <td>${p.species}</td>
                    <td>${p.breed}</td>
                    <td>${p.color}</td>
                    <td>${p.age_months}</td>
                    <td>${p.price}</td>
                </tr>
            `).join("");
            
            table.insertAdjacentHTML('beforeend', rows);
        });
        loadTotal();
}