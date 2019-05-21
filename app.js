const express = require('express');
const cookieParser = require("cookie-parser"); // https://stackoverflow.com/a/16209531/3569421
const path = require('path');
const http = require('http');
const upload = require("express-fileupload");
var bodyParser = require('body-parser');

const app = express();
const server = require('http').createServer(app);

app.use(cookieParser());
//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/public', express.static('./public'));
app.use(upload());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());


//Endereçamento de portas
app.use("/", require("./routes/index"));
app.use("/project", require("./routes/project"));
app.use("/download", require("./routes/download"));

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
    var addr = server.address();
    console.log("Conectado em ", addr.address + ":" + addr.port);

});
