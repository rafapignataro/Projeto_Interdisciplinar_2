const mysql = require("mysql");

var connection = mysql.createConnection({
	host     : 'localhost',
	port	 : 3306,
	user     : 'root',
	password : 'root',
	database : 'mydb'
});

connection.connect((err) => {
    if (!err){
        console.log('DB conectado!');

    }else {
        console.log('DB conexão falhada \n Erro: ' + JSON.stringify(err, undefined, 2));
    }
});

module.exports = connection;