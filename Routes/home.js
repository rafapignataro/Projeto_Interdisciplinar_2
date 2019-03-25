const express = require('express');
const router = express.Router();
const fs = require("fs");

router.get('/', function(req, res) {
	res.render("home");

});

router.post("/", function(req,res){
	if(req.files){
		var file = req.files.filename
		var filename = file.name;

		file.mv("public/upload/"+ filename, function(err){
			if(err){
				console.log(err);
				res.send("error occured");
			}else{
				res.render("home");	
			}
		});
	}
});

module.exports = router;