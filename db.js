require("dotenv").config();
const mysql = require("mysql2");
const fs = require("fs");

const connection = mysql.createConnection({
    host: "jobnest-db0-princuuu-6a41.l.aivencloud.com",
    port: 19996,
    user: "avnadmin",
    database: "defaultdb",
    password: process.env.DB_PASSWORD,
    ssl: {
        ca: process.env.DB_CA
    }
});

connection.connect((err) => {
    if (err) {
        console.log("Database connection error:", err);
        return;
    }
    console.log("connected");
});

module.exports = connection;