const mysql = require("mysql");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "db_parshare",
  port: 3306,
  multipleStatements: true,
  connectionLimit: 1000,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
});

db.getConnection((err) => {
  if (err) {
    return console.error(`error : ${err.message}`);
  }
  console.log(`Connected to MySQL Server`);
});

// const db = mysql.createConnection({
//   host : 'localhost',
//   user : 'root',
//   password : 'perbanas',
//   database : 'db_parshare',
//   port : 3306,
//   multipleStatements: true
// })

// db.connect((err) => {
//   if(err){
//       return console.log("Error: ",err)
//   }else{
//       return console.log("success connect to database")
//   }
// })

module.exports = { db };
