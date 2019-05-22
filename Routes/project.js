const express = require('express');
const router = express.Router();
const Sql = require("../infra/sql");

router.get('/getProjectInfo', async function(req,res){

	var questionID = req.body.questionID;
	console.log(questionID);

	try {
		await Sql.conectar(async (sql) => {
			try {
				sql.query("select p.titulo_pergunta, p.dt_pergunta from pergunta p inner join usuario u on (u.id_usuario = p.id_usuario)", function(error,result){
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

module.exports = router;