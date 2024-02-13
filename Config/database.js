const mysql = require("mysql");
require("dotenv").config()

const creatingConnections = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE_NAME,
  multipleStatements: false,
  // debug : true
});

creatingConnections.connect((err, results) => {
  if (err) { 
    console.log("database connections failed");
  } else {
    console.log("database connected succesfully");
  }
});

module.exports = creatingConnections;
