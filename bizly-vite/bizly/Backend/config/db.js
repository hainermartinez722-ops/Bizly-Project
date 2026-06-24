const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "Admin123",
  database: "bizly_db"
});

db.connect((err) => {
  if (err) {
    console.error(" Hay un error de conexión:", err);
    return;
  }

  console.log("Usted se ha conectado a MySQL");
});

module.exports = db;