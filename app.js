const express = require('express');
const path = require('path');
const http = require('http');
const upload = require("express-fileupload");
const fs = require("fs");


const app = express();
const server = require('http').createServer(app);

app.use('/public', express.static('public'));
app.use(upload());

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Endereçamento de portas
app.use("/", require("./routes/home"));

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
    var addr = server.address();
    console.log("Conectado em ", addr.address + ":" + addr.port);

});
