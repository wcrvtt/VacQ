const mysql = require('mysql');
var connection = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'tity1506',
    database: 'vacCenter'
});

module.exports = connection;