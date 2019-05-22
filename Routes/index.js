const express = require('express');
const wrap = require("express-async-error-wrapper");
const crypto_1 = require("crypto");
const router = express.Router();
const validaCookie = require("../utils/validaCookie");
const Sql = require("../infra/sql");

router.get('/', function(req, res) {
	res.render('index', { title: 'Bug Bank' });
});

router.get('/download', function(req, res) {
	res.render('download', { title: 'Download' });
});

router.get('/login', wrap(async function(req,res){

	var username = req.query["username"];
	var password = req.query["password"];

	if (username && password) {
		await Sql.conectar(async (sql) => {
			let rows = await sql.query('SELECT * FROM usuario WHERE login_usuario = ? AND senha_usuario = ?', [username, password]);
			if (rows && rows.length) {
				let idStr = "0000000" + rows[0].id_usuario.toString(16);
				let token = crypto_1.randomBytes(16).toString("hex");
				let cookieStr = idStr.substring(idStr.length - 8) + token;
				res.cookie("usuario", cookieStr, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, path: "/", secure: false });
				await sql.query('UPDATE usuario SET token = ? WHERE id_usuario = ?', [token, rows[0].id_usuario]);
				res.json("Bem vindo, " + username + "!");
			} else {
				res.statusCode = 403;
				res.json("Usuário e/ou senha incorretos");
			}
        });
	} else {
		res.statusCode = 400;
		res.json("Complete todos os campos!");
	}
}));

router.get('/fake_pagina', wrap(async function(req, res) {
	let u = await validaCookie(req);
	if (!u) {
		res.redirect('/sem_acesso');
		return;
	}
	res.render('index', { title: 'Bug Bank' });
}));

router.get('/fake_json', wrap(async function(req, res) {
	let u = await validaCookie(req, res);
	if (!u)
		return;
	res.json("obj");
}));

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

router.get('/getProjects', async (req,res) => {
	try {
		await Sql.conectar(async (sql) => {
			try {
				sql.query("select titulo_pergunta as title, dt_pergunta as date, nick_pergunta as nick, desc_pergunta as description, usuario.login_usuario as user, pergunta.id_pergunta as id from pergunta inner join usuario on ( usuario.id_usuario = pergunta.id_usuario)", function(error,result){
					res.json(result);
				});		
			} catch (ex) {
				res.json(ex);
			}
		});
	} catch (ex) {
		jsonRes(res, 500, ex.message || ex.toString());
	} 
});

router.get("/projects/:user&:title", async (req,res) => {
	var user = req.params.user;
	var title = req.params.title;

	res.render("project", {title: "Bug Bank", user: user});
});


module.exports = router;