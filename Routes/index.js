const express = require('express');
const wrap = require("express-async-error-wrapper");
const crypto_1 = require("crypto");
const router = express.Router();
const validaCookie = require("../utils/validaCookie");
const Sql = require("../infra/sql");

router.get('/', wrap(async function(req, res) {
	var user = req.params.user;
	var userLogado = false;
	let u = await validaCookie(req, res);
	if (!u){	
		res.render('index', { title: 'Bug Bank', userLogado: userLogado });
		return;
	}
	userLogado = true
	res.render('index', { title: 'Bug Bank', user: u.id, userLogado: userLogado });
}));

router.get('/download', function(req, res) {
	res.render('download', { title: 'Download' });
});

router.get('/profile/:user', wrap(async function(req, res) {
	var user = req.params.user;
	var userLogado = false;
	let u = await validaCookie(req, res);
	if (!u){	
		res.render('perfil', { title: 'Perfil', userLogado: userLogado });
		return;
	}
	userLogado = true
	res.render('perfil', { title: 'Perfil', user: u.id, userLogado: userLogado });
}));

router.get('/criar-bug', function(req, res) {
	res.render('criar-bug', { title: 'criar-bug' });
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

// router.get('/fake_pagina', wrap(async function(req, res) {
// 	let u = await validaCookie(req);
// 	if (!u) {
// 		res.redirect('/sem_acesso');
// 		return;
// 	}
// 	res.render('index', { title: 'Bug Bank' });
// }));

router.get('/getUserProjects', wrap(async function(req, res) {
	let u = await validaCookie(req, res);
	if (!u)
		return;
	await Sql.conectar(async (sql) => {
		let rows = await sql.query('SELECT * FROM pergunta WHERE id_usuario = ?', [u.id]);
		if (rows && rows.length) {
			res.json(rows);
		} else {
			res.json("Usuario não possui projetos!");
		}
	});
}));

router.get('/logout', wrap(async function(req, res) {
	let u = await validaCookie(req);
	if (u) {
		await Sql.conectar(async (sql) => {
			await sql.query('UPDATE usuario SET token = null WHERE id_usuario = ?', [u.id_usuario]);
        });
	}
	res.cookie("usuario", "", { expires: new Date(Date.now() - 31536000000), httpOnly: true, path: "/", secure: false });
	res.redirect("/");
}));

router.post('/register', wrap(async function(req, res) {

	let user = req.body;
	if(user.username && user.email && user.password && user.repeat){
		if(user.password == user.repeat){
			await Sql.conectar(async (sql) => {
				let rows = await sql.query('SELECT * FROM usuario WHERE login_usuario = ?', [user.username]);
				if (rows && rows.length) {
					res.json('Esse usuario já existe!');
				} else {
					await sql.query('INSERT INTO usuario (login_usuario,email_usuario,senha_usuario, deleted_usuario) values (?,?,?,1)', [user.username, user.email, user.password]);
					res.json(`Cadastro concluído!\n Bem vindo, ${user.username}!`);
				}
			});
		}else{
			res.json("As senhas não coincidem!");
		}
	}else{
		res.json("Complete todos os campos!");
	}
}));

router.get('/getProjects/:dataID', async (req,res) => {
	
	var dataID = req.params.dataID;

	try {
		await Sql.conectar(async (sql) => {
			try {
				if(dataID == "az"){
					sql.query("select titulo_pergunta as title, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, nick_pergunta as nick, desc_pergunta as description, usuario.login_usuario as user, pergunta.id_pergunta as id from pergunta inner join usuario on ( usuario.id_usuario = pergunta.id_usuario) order by title ASC", function(error,result){
						if(error){
							console.log(error);
						}
						res.json(result);
					});	
				}else if(dataID == "za"){
					sql.query("select titulo_pergunta as title, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, nick_pergunta as nick, desc_pergunta as description, usuario.login_usuario as user, pergunta.id_pergunta as id from pergunta inner join usuario on ( usuario.id_usuario = pergunta.id_usuario) order by title DESC", function(error,result){
						res.json(result);
					});	
				}
				else if(dataID == "recente"){
					sql.query("select titulo_pergunta as title, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, nick_pergunta as nick, desc_pergunta as description, usuario.login_usuario as user, pergunta.id_pergunta as id from pergunta inner join usuario on ( usuario.id_usuario = pergunta.id_usuario) order by date asc", function(error,result){
						res.json(result);
					});	
				}else {
					sql.query("select titulo_pergunta as title, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, nick_pergunta as nick, desc_pergunta as description, usuario.login_usuario as user, pergunta.id_pergunta as id from pergunta inner join usuario on ( usuario.id_usuario = pergunta.id_usuario)", function(error,result){
						res.json(result);
					});	
				}	
			} catch (ex) {
				res.json(ex);
			}
		});
	} catch (ex) {
		res.json(ex);
	} 
});

router.get("/projects/:id/:title", async (req,res) => {
	var questionID = req.params.id;

	try {
		await Sql.conectar(async (sql) => {
			try {
				sql.query("select titulo_pergunta as title, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, desc_pergunta as description, usuario.login_usuario as user, pergunta.id_pergunta" + 
				" from pergunta inner join usuario on ( usuario.id_usuario = pergunta.id_usuario)" + 
				" where pergunta.id_pergunta = " + questionID , function(error,result){
					res.render("project", { result: result[0]});
				});		
			} catch (ex) {
				res.json(ex);
			}
		});
	} catch (ex) {
		res.json(ex);
	} 	
});

module.exports = router;