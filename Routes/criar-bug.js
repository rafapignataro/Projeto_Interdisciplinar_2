const express = require('express');
const router = express.Router();
const validaCookie = require("../utils/validaCookie");
const Sql = require("../infra/sql");

router.get('/profile/:user/gerenciar-bugs', wrap(async function(req, res) {
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