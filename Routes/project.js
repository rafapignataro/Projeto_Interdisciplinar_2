const express = require('express');
const router = express.Router();

router.get('/:user', async function(req,res){
	var user = req.params.user;

	res.render('user', {title: user});
});

module.exports = router;