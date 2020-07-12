const mysql  = require('mysql');
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ziphlot',
    database: 'matcha_db_b',
    port: 3306
  });


module.exports = connection;