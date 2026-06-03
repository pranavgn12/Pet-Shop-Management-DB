const http = require("http");
const fs = require("fs");
const url = require("url");
const db = require("./db");

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);

    if (req.method === "GET" && parsed.pathname === "/pets") {
        db.query(
            "SELECT * FROM pets ORDER BY arrival_date DESC LIMIT 5",
            (err, results) => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(results));
            }
        );
    }
if (req.method === "POST" && parsed.pathname === "/save-pet") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        const p = JSON.parse(body);
        p.customer_id =
             p.customer_id === "" || p.customer_id === undefined
        ? null
        : Number(p.customer_id);
        db.query(
            "SELECT pet_id FROM pets WHERE pet_id = ?",
            [p.pet_id],
            (err, rows) => {
                if (rows.length > 0) {
                    db.query(
                        "UPDATE pets SET name=?, gender=?, species=?, breed=?, color=?, age_months=?, price=?, arrival_date=?, health_notes=?, status=?, customer_id=?, supplier_id=? WHERE pet_id=?",
                        [p.name, p.gender, p.species, p.breed, p.colour, p.age, p.price, p.arrival_date, p.health_notes, p.status, p.customer_id, p.supplier, p.pet_id],
                        () => res.end("Pet Updated")
                    );
                } else {
                    db.query(
                        "INSERT INTO pets (pet_id, name, gender, species, breed, color, age_months, price, arrival_date, health_notes, status, customer_id, supplier_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                        [p.pet_id, p.name, p.gender, p.species, p.breed, p.colour, p.age, p.price, p.arrival_date, p.health_notes, p.status, p.customer_id, p.supplier],
                        () => res.end("Pet Added")
                    );
                }
            }
        );
    });
}

if (req.method === "POST" && parsed.pathname === "/save-customer") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        const p = JSON.parse(body);
        db.query(
            "SELECT customer_id FROM customers WHERE customer_id = ?",
            [p.customer_id],
            (err, rows) => {
                if (rows.length > 0) {
                    db.query(
                        "UPDATE customers SET full_name=?, phone=?, email=?, address=?, created_at=? WHERE customer_id=?",
                        [p.full_name, p.phone, p.email, p.address, p.created_at, p.customer_id],
                        () => res.end("Customer Updated")
                    );
                } else {
                    db.query(
                        "INSERT INTO customers (customer_id, full_name, phone, email, address, created_at) VALUES (?,?,?,?,?,?)",
                        [p.customer_id, p.full_name, p.phone, p.email, p.address, p.created_at],
                        () => res.end("Customer Added")
                    );
                }
            }
        );
    });
}
                       
if (req.method === "POST" && parsed.pathname === "/save-order") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        const d = JSON.parse(body);
        db.query(
            "SELECT order_id FROM orders WHERE order_id = ?",
            [d.order_id],
            (err, rows) => {
                if (rows.length > 0) {
                    db.query(
                        "UPDATE orders SET customer_id=?, order_date=?, payment_method=? WHERE order_id=?",
                        [d.customer_id, d.order_date, d.payment_method, d.order_id],
                        () => res.end("Order Updated")
                    );
                } else {
                    db.query(
                        "INSERT INTO orders (order_id, customer_id, order_date, payment_method) VALUES (?,?,?,?)",
                        [d.order_id, d.customer_id, d.order_date, d.payment_method],
                        () => res.end("Order Added")
                    );
                }
            }
        );
    }); 
}


/*if (req.method === "POST" && parsed.pathname === "/save-order") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const d = JSON.parse(body);
        db.query(
            "INSERT INTO orders (order_id, customer_id, order_date, payment_method) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE order_id=?",
            [d.order_id, d.customer_id, d.order_date, d.payment_method, d.order_id],
            () => res.end("Order Saved")
        );
    });
}*/

if (req.method === "POST" && parsed.pathname === "/add-order-item") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const d = JSON.parse(body);

        db.query(
            "SELECT status FROM pets WHERE pet_id=?",
            [d.pet_id],
            (err, rows) => {
                if (!rows.length || rows[0].status !== "Available") {
                    res.end("NOT_AVAILABLE");
                    return;
                }

                db.query(
                    "INSERT INTO order_items (order_id, pet_id, price) VALUES (?,?,?)",
                    [d.order_id, d.pet_id, d.price],
                    () => res.end("ADDED")
                );
            }
        );
    });
}

if (req.method === "POST" && parsed.pathname === "/remove-order-item") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const { order_id, pet_id } = JSON.parse(body);

        db.query(
            "DELETE FROM order_items WHERE order_id=? AND pet_id=?",
            [order_id, pet_id],
            () => res.end("REMOVED")
        );
    });
    
}
if (req.method === "GET" && parsed.pathname === "/order-items") {
    const order_id = parsed.query.order_id;

    if (!order_id) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("order_id is required");
        return;
    }

    db.query(
        `SELECT p.pet_id,p.name,p.species,p.breed,p.color,p.age_months,oi.price
         FROM order_items oi
         JOIN pets p ON oi.pet_id = p.pet_id
         WHERE oi.order_id=?`,
        [order_id],
        (err, rows) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end(err.message);
                return;
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(rows));
        }
    );
}

if (req.method === "GET" && parsed.pathname === "/order-total") {
    const order_id = parsed.query.order_id;

    db.query(
        "SELECT IFNULL(SUM(price),0) AS total FROM order_items WHERE order_id=?",
        [order_id],
        (err, rows) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(rows[0]));
        }
    );
}
if (req.method === "GET" && parsed.pathname === "/all-suppliers") {
    db.query(
        "SELECT * FROM suppliers ORDER BY supplier_id DESC",
        (err, rows) => {
            if (err) {
                res.writeHead(500);
                res.end(err.message);
                return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(rows));
        }
    );
}

if (req.method === "POST" && parsed.pathname === "/save-supplier") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        const s = JSON.parse(body);
        db.query(
            "SELECT supplier_id FROM suppliers WHERE supplier_id = ?",
            [s.supplier_id],
            (err, rows) => {
                if (rows.length > 0) {
                    db.query(
                        "UPDATE suppliers SET name=?, contact_person=?, phone=?, email=?, address=? WHERE supplier_id=?",
                        [s.name, s.contact_person, s.phone, s.email, s.address, s.supplier_id],
                        () => res.end("Supplier Updated")
                    );
                } else {
                    db.query(
                        "INSERT INTO suppliers (supplier_id, name, contact_person, phone, email, address) VALUES (?,?,?,?,?,?)",
                        [s.supplier_id, s.name, s.contact_person, s.phone, s.email, s.address],
                        () => res.end("Supplier Added")
                    );
                }
            }
        );
    });
}



if (req.method === "POST" && parsed.pathname === "/delete-supplier") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const { supplier_id } = JSON.parse(body);

        db.query(
            "DELETE FROM suppliers WHERE supplier_id=?",
            [supplier_id],
            err => {
                if (err) {
                    res.writeHead(500);
                    res.end(err.message);
                    return;
                }
                res.end("DELETED");
            }
        );
    });
}

if (req.method === "GET" && parsed.pathname === "/all-orders") {
    db.query(
        `SELECT 
            o.order_id,
            p.pet_id,
            p.name AS pet_name
         FROM orders o
         LEFT JOIN order_items oi ON o.order_id = oi.order_id
         LEFT JOIN pets p ON oi.pet_id = p.pet_id
         ORDER BY o.order_id DESC`,
        (err, rows) => {
            if (err) {
                res.writeHead(500);
                res.end(err.message);
                return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(rows));
        }
    );
}

if (req.method === "POST" && parsed.pathname === "/delete-order") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const { order_id } = JSON.parse(body);

        db.query(
            "DELETE FROM order_items WHERE order_id=?",
            [order_id],
            err => {
                if (err) {
                    res.writeHead(500);
                    res.end(err.message);
                    return;
                }

                db.query(
                    "DELETE FROM orders WHERE order_id=?",
                    [order_id],
                    err2 => {
                        if (err2) {
                            res.writeHead(500);
                            res.end(err2.message);
                            return;
                        }
                        res.end("ORDER_DELETED");
                    }
                );
            }
        );
    });
}

if (req.method === "GET" && parsed.pathname === "/all-customers") {
    db.query(
        "SELECT * FROM customers ORDER BY customer_id ASC",
        (err, rows) => {
            if (err) {
                res.writeHead(500);
                res.end(err.message);
                return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(rows));
        }
    );
}
if (req.method === "POST" && parsed.pathname === "/delete-customer") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const { customer_id } = JSON.parse(body);

        // 1️⃣ Unlink pets
        db.query(
            "UPDATE pets SET customer_id=NULL WHERE customer_id=?",
            [customer_id],
            err => {
                if (err) {
                    res.writeHead(500);
                    res.end(err.message);
                    return;
                }

                // 2️⃣ Unlink orders
                db.query(
                    "UPDATE orders SET customer_id=NULL WHERE customer_id=?",
                    [customer_id],
                    err2 => {
                        if (err2) {
                            res.writeHead(500);
                            res.end(err2.message);
                            return;
                        }

                        // 3️⃣ Delete customer
                        db.query(
                            "DELETE FROM customers WHERE customer_id=?",
                            [customer_id],
                            err3 => {
                                if (err3) {
                                    res.writeHead(500);
                                    res.end(err3.message);
                                    return;
                                }
                                res.end("CUSTOMER_DELETED");
                            }
                        );
                    }
                );
            }
        );
    });
}
/*if (req.method === "POST" && parsed.pathname === "/delete-customer") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const { customer_id } = JSON.parse(body);

        // 1️⃣ Unlink pets
        db.query(
            "UPDATE pets SET customer_id=NULL WHERE customer_id=?",
            [customer_id],
            err => {
                if (err) {
                    res.writeHead(500);
                    res.end(err.message);
                    return;
                }

                // 2️⃣ Delete customer
                db.query(
                    "DELETE FROM customers WHERE customer_id=?",
                    [customer_id],
                    err2 => {
                        if (err2) {
                            res.writeHead(500);
                            res.end(err2.message);
                            return;
                        }
                        res.end("CUSTOMER_DELETED");
                    }
                );
            }
        );
    });
}
*/
if (req.method === "POST" && parsed.pathname === "/proceed-order") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const { order_id, customer_id } = JSON.parse(body);

        db.query(
            "SELECT total_amount FROM orders WHERE order_id=?",
            [order_id],
            (err, rows) => {
                if (err || rows.length === 0) {
                    res.writeHead(400);
                    res.end("Invalid order");
                    return;
                }

                // Already proceeded
                if (rows[0].total_amount !== null) {
                    res.writeHead(409);
                    res.end("Order already completed");
                    return;
                }

                // Calculate total
                db.query(
                    "SELECT IFNULL(SUM(price),0) AS total FROM order_items WHERE order_id=?",
                    [order_id],
                    (err, sumRows) => {
                        const total = sumRows[0].total;

                        if (total === 0) {
                            res.writeHead(400);
                            res.end("No items in order");
                            return;
                        }

                        // Save total
                        db.query(
                            "UPDATE orders SET total_amount=? WHERE order_id=?",
                            [total, order_id]
                        );

                        // Mark pets as sold (only if available)
                        db.query(
                            `UPDATE pets 
                             SET status='Sold', customer_id=? 
                             WHERE status='Available'
                             AND pet_id IN (
                                SELECT pet_id FROM order_items WHERE order_id=?
                             )`,
                            [customer_id, order_id],
                            () => res.end("COMPLETED")
                        );
                    }
                );
            }
        );
    });
}




/*if (req.method === "POST" && parsed.pathname === "/add-pet") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        const p = JSON.parse(body);
        db.query(
    "INSERT INTO pets (pet_id, name, species, breed, age_months, price, supplier_id) VALUES (?,?,?,?,?,?,?)",
    [
        p.pet_id,
        p.name,
        p.species,
        p.breed,
        p.age,
        p.price,
        p.supplier
    ],
    (err) => {
        if (err) {
            res.writeHead(500);
            return res.end(err.message);
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Pet Added");
    }
);
    });
}*/
  /*  if (req.method === "GET" && parsed.pathname === "/all-pets") {
    db.query(
        "SELECT pet_id, name FROM pets ORDER BY pet_id DESC",
        (err, results) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(results));
        }
    );
}*/

/*if (req.method === "POST" && parsed.pathname === "/save-pet") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        const p = JSON.parse(body);

        if (!p.pet_id) {
            res.statusCode = 400;
            return res.end("pet_id required");
        }

        const data = [
            p.name || null,
            p.species || null,
            p.breed || null,
            p.age || null,
            p.price || null,
            p.supplier || null
        ];

        db.query(
            "SELECT pet_id FROM pets WHERE pet_id = ?",
            [p.pet_id],
            (err, rows) => {
                if (rows.length === 0) {
                    db.query(
                        `INSERT INTO pets
                         (pet_id, name, species, breed, age_months, price, supplier_id)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [p.pet_id, ...data],
                        () => res.end("Pet Added")
                    );
                } else {
                    db.query(
                        `UPDATE pets SET
                         name = ?, species = ?, breed = ?, age_months = ?, price = ?, supplier_id = ?
                         WHERE pet_id = ?`,
                        [...data, p.pet_id],
                        () => res.end("Pet Updated")
                    );
                }
            }
        );
    });
}
*/
if (req.method === "POST" && parsed.pathname === "/delete-pet") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        const { pet_id } = JSON.parse(body);

        db.query(
            "DELETE FROM pets WHERE pet_id = ?",
            [pet_id],
            () => res.end("Pet Removed")
        );
    });
}

if (req.method === "GET" && parsed.pathname === "/all-pets") {
    db.query(
        "SELECT pet_id, name, species, breed, gender, color, age_months, price, arrival_date, health_notes, status, customer_id, supplier_id FROM pets ORDER BY pet_id ASC",
        (err, rows) => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(rows));
        }
    );
}


/*if (req.method === "POST" && parsed.pathname === "/add-pet-simple") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        const { pet_id, name } = JSON.parse(body);

        if (!pet_id || !name) {
            res.end("pet_id and name required");
            return;
        }

        db.query(
            "INSERT INTO pets (pet_id, name, species, price) VALUES (?, ?, 'Unknown', 0)",
            [pet_id, name],
            err => {
                if (err) {
                    res.end("Pet ID already exists");
                    return;
                }

                db.query(
                    "INSERT INTO transactions (transaction_type,item_type,item_id) VALUES ('ADD_PET','Pet',?)",
                    [pet_id]
                );

                res.end("Pet Added");
            }
        );
    });
}
if (req.method === "POST" && parsed.pathname === "/remove-pet") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
        const { pet_id } = JSON.parse(body);

        db.query(
            "DELETE FROM pets WHERE pet_id = ?",
            [pet_id],
            result => {
                if (result.affectedRows === 0) {
                    res.end("Pet not found");
                    return;
                }

                db.query(
                    "INSERT INTO transactions (transaction_type,item_type,item_id) VALUES ('SELL_PET','Pet',?)",
                    [pet_id]
                );

                res.end("Pet Removed");
            }
        );
    });
}

    /*if (req.method === "GET" && parsed.pathname === "/all-pets") {
    db.query("SELECT pet_id, name FROM pets ORDER BY pet_id DESC", (err, rows) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(rows));
    });*/

/*if (req.method === "POST" && parsed.pathname === "/delete-pet") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const { pet_id } = JSON.parse(body);

        db.query(
            "SELECT price FROM pets WHERE pet_id=?",
            [pet_id],
            (err, rows) => {
                if (rows.length === 0) {
                    res.end("Pet not found");
                    return;
                }

                const price = rows[0].price;

                db.query("DELETE FROM pets WHERE pet_id=?", [pet_id]);
                db.query(
                    "INSERT INTO transactions (transaction_type,item_type,item_id,amount) VALUES ('ADD_PET','Pet',?,?)",
                    [pet_id, price]
                );

                res.end("Pet deleted");
            }
        );
    });
}

if (req.method === "POST" && parsed.pathname === "/add-pet") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const p = JSON.parse(body);

        if (!p.pet_id) {
            res.end("Pet ID required");
            return;
        }

        db.query(
            "INSERT INTO pets (pet_id, name, species, price) VALUES (?,?,?,?)",
            [p.pet_id, p.name, "Unknown", 0],
            err => {
                if (err) {
                    res.end("Pet ID already exists");
                    return;
                }

                db.query(
                    "INSERT INTO transactions (transaction_type,item_type,item_id) VALUES ('ADD_PET','Pet',?)",
                    [p.pet_id]
                );

                res.end("Pet Added");
            }
        );
    });
}

    /*if (req.method === "POST" && parsed.pathname === "/add-pet") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const p = JSON.parse(body);

            db.query(
                "INSERT INTO pets (name,species,breed,age_months,price,supplier_id) VALUES (?,?,?,?,?,?)",
                [p.name, p.species, p.breed, p.age, p.price, p.supplier],
                (err, result) => {
                    db.query(
                        "INSERT INTO transactions (transaction_type,item_type,item_id,amount) VALUES ('ADD_PET','Pet',?,?)",
                        [result.insertId, p.price]
                    );
                    res.end("Pet Added");
                }
            );
        });
    }*/

  /*      if (req.method === "POST" && parsed.pathname === "/add-or-replace-pet") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
        const p = JSON.parse(body);

        const petId = p.pet_id ? Number(p.pet_id) : null;

        const sql = `
            INSERT INTO pets (
                pet_id, name, species, breed, age_months,
                gender, color, price, supplier_id, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available')
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                species = VALUES(species),
                breed = VALUES(breed),
                age_months = VALUES(age_months),
                gender = VALUES(gender),
                color = VALUES(color),
                price = VALUES(price),
                supplier_id = VALUES(supplier_id)
        `;

        const values = [
            petId,
            p.name,
            p.species,
            p.breed,
            p.age_months,
            p.gender,
            p.color,
            p.price,
            p.supplier_id
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                res.writeHead(500);
                return res.end(err.message);
            }

            const action =
                result.affectedRows === 1 ? 'ADD_PET' : 'UPDATE_PET';

            const finalPetId = petId || result.insertId;

            db.query(
                "INSERT INTO transactions (transaction_type,item_type,item_id,amount) VALUES (?,?,?,?)",
                [action, 'Pet', finalPetId, p.price || 0]
            );

            res.end(JSON.stringify({ success: true, action, pet_id: finalPetId }));
        });
    });
}
*/
    if (req.method === "POST" && parsed.pathname === "/sell-pet") {
        let body = "";
        req.on("data", c => body += c);
        req.on("end", () => {
            const s = JSON.parse(body);

            db.query(
                "UPDATE pets SET status='Sold' WHERE pet_id=?",
                [s.pet_id]
            );

            db.query(
                "INSERT INTO orders (customer_id,total_amount,payment_method) VALUES (?,?,?)",
                [s.customer_id, s.amount, "Cash"],
                (err, order) => {
                    db.query(
                        "INSERT INTO transactions (transaction_type,item_type,item_id,amount,customer_id,order_id) VALUES ('SELL_PET','Pet',?,?,?,?)",
                        [s.pet_id, s.amount, s.customer_id, order.insertId]
                    );
                    res.end("Pet Sold");
                }
            );
        });
    }

    if (req.method === "GET") {
        const filePath = "./public" + (req.url === "/" ? "/index.html" : req.url);
        fs.readFile(filePath, (err, data) => {
            if (err) return;
            res.end(data);
        });
    }
});

server.listen(3000, () => console.log("Server running on 3000"));
