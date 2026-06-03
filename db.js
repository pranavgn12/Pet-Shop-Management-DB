const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "qq123",
    database: "petshop"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected");
});

module.exports = db;
