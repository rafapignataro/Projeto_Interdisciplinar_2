const express = require('express');
const router = express.Router();
const Sql = require("../infra/sql");

router.get('/', function(req, res) {
	res.render('index', { title: 'Bug Bank' });
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
		res.json("Complete todos os campos!");
	}
});


router.post('/register', function(req, res) {

	let user = req.body;
	console.log(user);
	if(user.username && user.email && user.password && user.repeat){
		if(user.password == user.repeat){
			Sql.query('SELECT * FROM usuario WHERE login_usuario = ?', user.username, function(error, result, fields) {
				if (error) throw error;

				if (result.length > 0) {
					res.json('Esse usuario já existe!');
				} else {
					Sql.query(`INSERT INTO usuario (login_usuario,email_usuario,senha_usuario, deleted_usuario) values ("${user.username}","${user.email}","${user.password}",1)`);
					res.json('Cadastro concluído!\n Bem vindo, ' + user.username + "!");
				}			
			});
		}else{
			res.json("As senhas não coincidem!");
		}
	}else{
		res.json("Complete todos os campos!");
	}
});
module.exports = router;