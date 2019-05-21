"use strict";
const Sql = require("../infra/sql");

module.exports = async function validaCookie (req, res) {
    let cookieStr = req.cookies["usuario"];
    if (!cookieStr || cookieStr.length !== 40) {
        if (res) {
            res.statusCode = 403;
            res.json("Não permitido");
        }
        return null;
    } else {
        let id = parseInt(cookieStr.substr(0, 8), 16);
        let login_usuario = null;
        await Sql.conectar(async (sql) => {
            let rows = await sql.query("select login_usuario, token from usuario where id_usuario = ?", [id]);
            let row;
            if (!rows || !rows.length || !(row = rows[0]))
                return;
            let token = cookieStr.substring(8);
            if (!row.token || token !== row.token)
                return;
            login_usuario = row.login_usuario;
        });
        if (!login_usuario) {
            if (res) {
                res.statusCode = 403;
                res.json("Não permitido");
            }
            return null;
        }
        return { id: id, login_usuario: login_usuario };
    }
};
