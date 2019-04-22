const express = require('express');
const router = express.Router();
const Sql = require("../infra/sql");

router.get('/', function(req, res) {
	res.render("index");

});

router.get('/login', function(req,res){

	var username = req.query["username"];
	var password = req.query["password"];

	if (username && password) {

		Sql.query('SELECT * FROM usuario WHERE login_usuario = ? AND senha_usuario = ?', [username, password], function(error, result, fields) {
			if (error) throw error;

			if (result.length > 0) {
				res.json("Bem vindo, " + username + "!");
			} else {
				res.json("Usuário e/ou senha incorretos");
			}			
		});
	} else {
		res.json("Complete todos os campos");
	}
});


router.post('/register', function(req, res) {

});
module.exports = router;