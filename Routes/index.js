const express = require('express');
const wrap = require("express-async-error-wrapper");
const crypto_1 = require("crypto");
const router = express.Router();
const validaCookie = require("../utils/validaCookie");
const Sql = require("../infra/sql");
const fs = require('fs');

router.get('/', wrap(async function(req, res) {
	var user = req.params.user;
	var userLogado = false;
	let u = await validaCookie(req, res);
	if (!u){
		res.render('index', { title: 'Bug Bank', userLogado: userLogado, user: u, userLogged: null});
		return;
	}
    userLogado = true;
	res.render('index', { title: 'Bug Bank', user: u.id, userLogado: userLogado, userLogged: u.login_usuario });
}));

router.get('/download', function(req, res) {
	res.render('download', { title: 'Download' });
});

router.get('/loginpage', wrap(async function (req, res) {
    var userLogado = false;
    let u = await validaCookie(req, res);
    if (!u) {
        res.render('loginpage', { title: 'login page', userLogado: userLogado });
        return;
    }
    userLogado = true
    res.render('index', { title: 'Bugbase', user: u.id, userLogado: userLogado, userLogged: u.login_usuario });
}));

router.get('/profile/:user', wrap(async function(req, res) {
	var user = req.params.user;
	var userLogado = false;
	let u = await validaCookie(req, res);
	if (!u){
		res.render('perfil', { title: 'Perfil', userLogado: userLogado, userLogged: null, profileOwner: false, profileOwnerName: user });
		return;
	}
	userLogado = true
	var profileOwner = false;
	if(u.login_usuario == user){
		profileOwner = true;
	}
	res.render('perfil', { title: 'Perfil', user: u.id, userLogado: userLogado, userLogged: u.login_usuario, profileOwner: profileOwner, profileOwnerName: user});
}));

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

router.get('/getUserProjects', wrap(async function(req, res) {
	let u = await validaCookie(req, res);
	if (!u){
			return;
	}
	await Sql.conectar(async (sql) => {
		let rows = await sql.query("select titulo_pergunta, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, desc_pergunta, tag, id_pergunta, favorited from pergunta WHERE id_usuario = ?", [u.id]);
		if (rows && rows.length) {
			res.json(rows);
		} else {
			res.json("Usuario não possui projetos!");
		}
	});
}));

router.get('/getProjectsProfile', wrap(async function(req, res) {

	var data = req.query["profileOwnerOffline"];
	await Sql.conectar(async (sql) => {
		let rows = await sql.query("select titulo_pergunta, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, desc_pergunta, tag, id_pergunta, favorited, u.email_usuario, u.bio_usuario from pergunta inner join usuario u on ( u.id_usuario = pergunta.id_usuario) WHERE login_usuario = ?", [data]);
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
					await sql.query('INSERT INTO usuario (login_usuario,email_usuario,senha_usuario, deleted_usuario) values (?,?,?,0)', [user.username, user.email, user.password]);
					res.json(`Cadastro concluído!\n Bem vindo, ${user.username}!`);

					fs.mkdir('Public/Users/' + user.username, function(error, data){
						if(error){
							throw error;
						}
					});
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
					sql.query("select titulo_pergunta as title, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, desc_pergunta as description, tag, usuario.login_usuario as user, pergunta.id_pergunta as id from pergunta inner join usuario on ( usuario.id_usuario = pergunta.id_usuario) order by title ASC", function(error,result){
						if(error){
							console.log(error);
						}
						res.json(result);
					});
				}else if(dataID == "za"){
					sql.query("select titulo_pergunta as title, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, desc_pergunta as description, tag, usuario.login_usuario as user, pergunta.id_pergunta as id from pergunta inner join usuario on ( usuario.id_usuario = pergunta.id_usuario) order by title DESC", function(error,result){
						res.json(result);
					});
				}
				else if(dataID == "recente"){
					sql.query("select titulo_pergunta as title, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, desc_pergunta as description, tag, usuario.login_usuario as user, pergunta.id_pergunta as id from pergunta inner join usuario on ( usuario.id_usuario = pergunta.id_usuario) order by date asc", function(error,result){
						res.json(result);
					});
				}else {
					sql.query("select titulo_pergunta as title, DATE_FORMAT(dt_pergunta, '%d/%m/%Y') as date, desc_pergunta as description, tag, usuario.login_usuario as user, pergunta.id_pergunta as id from pergunta inner join usuario on ( usuario.id_usuario = pergunta.id_usuario)", function(error,result){
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

router.get('/profile/:user/manage-bugs', wrap(async function(req, res) {
	var user = req.params.user;
	var userLogado = false;
	let u = await validaCookie(req, res);
	if (!u){
		res.render('loginpage', { title: 'Login Page', userLogado: userLogado });
		return;
	}
	userLogado = true
	res.render('manage-bugs', { title: 'Gerenciar Projetos', user: u.id, userLogado: userLogado, userLogged: u.login_usuario });
}));

router.get('/create-bug', wrap(async function(req, res) {
	var user = req.params.user;
	var userLogado = false;
	let u = await validaCookie(req, res);
	if (!u){
		res.render('loginpage', { title: 'Login Page', userLogado: userLogado });
		return;
	}
	userLogado = true
	res.render('criar-bug', { title: 'Criar bug', user: u.id, userLogado: userLogado, userLogged: u.login_usuario });
}));

router.post('/createBug', wrap(async function(req, res) {

	let project = req.body;
	if(project.title && project.description && project.tag){
		await Sql.conectar(async (sql) => {

			await sql.query('INSERT INTO pergunta (titulo_pergunta, dt_pergunta, desc_pergunta, id_usuario, tag) values (?,curdate(),?,?,?)', [project.title, project.description, project.userId, project.tag]);
			res.json('Bug criado!');
		});
	}else{

		res.json("Complete todos os campos!");
	}
}));

router.post('/favorite', async function(req,res){

	var bugFavoritedId = req.body.bugId;

	await Sql.conectar(async (sql) => {
		let rows = await sql.query('SELECT favorited FROM pergunta WHERE id_pergunta = ?', [bugFavoritedId]);
		if(rows && rows[0].favorited == 0){
			await sql.query('UPDATE pergunta SET favorited = true where id_pergunta = ?', [bugFavoritedId]);
			return res.json({
				favorited: true,
				bugId: bugFavoritedId
			});
		}else{
			await sql.query('UPDATE pergunta SET favorited = false where id_pergunta = ?', [bugFavoritedId]);
			return res.json({
				favorited: false,
				bugId: bugFavoritedId
			});
		}
	});
});

router.delete('/deleteBug', async function(req,res){
	var bugDeletedId = req.body.bugId;

	await Sql.conectar(async (sql) => {
		let rows = await sql.query('SELECT id_pergunta FROM pergunta WHERE id_pergunta = ?', [bugDeletedId]);
		if(rows && rows.length){
			await sql.query('DELETE FROM pergunta where id_pergunta = ?', [bugDeletedId]);
			return res.json(bugDeletedId + "foi deletado");
		}else{
			return res.json(bugDeletedId + "não pôde ser deletado");
		}
	});
});

router.post('/updateProfile', wrap(async function(req, res) {

	await Sql.conectar(async (sql) => {
			var row = await sql.query('select id_usuario from usuario where login_usuario = ?', [req.body.profileOwnerName]);
			await sql.query('UPDATE usuario SET bio_usuario = ? WHERE id_usuario = ?', [req.body.bio, row[0].id_usuario]);
			res.json("Bio editada");
			});
}));

module.exports = router;
