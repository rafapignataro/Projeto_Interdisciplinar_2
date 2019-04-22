const express = require('express');
const path = require('path');
const http = require('http');
const upload = require("express-fileupload");
var bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const server = require('http').createServer(app);

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/public', express.static('./public'));
app.use(upload());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());
app.use(session({
  'secret': 'teste'
}));

//Endereçamento de portas
app.use("/", require("./routes/index"));
app.use("/code", require("./routes/home"));

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
    var addr = server.address();
    console.log("Conectado em ", addr.address + ":" + addr.port);

});
