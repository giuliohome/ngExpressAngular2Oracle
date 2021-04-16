const sqlite3 = require('sqlite3');
const express = require("express");
const cors = require('cors');
 
var bodyParser = require('body-parser');
 
var app = express();
app.use(cors()); // add config (see for example oracle branch example)
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
 
 
const HTTP_PORT = 8000
app.listen(HTTP_PORT, () => {
    console.log("Server is listening on port " + HTTP_PORT);
});
 
const db = new sqlite3.Database('./emp_database.db', (err) => {
    if (err) {
        console.error("Erro opening database " + err.message);
    } else {
 
        db.run('CREATE TABLE heroes( \
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
            name NVARCHAR(20)  NOT NULL\
        )', (err) => {
            if (err) {
                console.log("Table already exists.");
                return;
            }
            let insert = 'INSERT INTO heroes (name) VALUES (?)';
            db.run(insert, ['Dr Nice']);
            db.run(insert, ['Narco']);
            db.run(insert, ['Bombasto']);
            db.run(insert, ['Celeritas']);
            db.run(insert, ['Magneta']);
            db.run(insert, ['RubberMan']);
        });
    }
});
 
app.get("/heroes/:id", (req, res, next) => {
    var params = [req.params.id]
    db.get("SELECT * FROM heroes where id = ?", [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(200).json(row);
    });
});
 
app.get("/heroes/", (req, res, next) => {
    console.log('get params',req.query);
    if (req.query && req.query.name) {
        search = '%' + req.query.name + '%';
    } else {
        search = '%';
    }
    db.all("SELECT * FROM heroes where name like ?", [search], (err, rows) => {
        if (err) {
            console.log(err.message);
            res.status(400).json({ "error": "sql error" });
            return;
        }
        res.status(200).json(rows);
    });
});
 
app.post("/heroes/", (req, res, next) => {
    var reqBody = req.body;
    console.log(reqBody);
    db.run("INSERT INTO heroes (name) VALUES (?)",
        [reqBody.name],
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": err.message })
                return;
            }
            res.status(201).json({
                "id": this.lastID, "name": reqBody.name
            })
        });
});
 
app.put("/heroes", (req, res, next) => {
    var reqBody = req.body;
    var hero = [reqBody.name, reqBody.id]
    db.run(`UPDATE heroes set name = ? WHERE id = ?`,
        hero,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.status(200).json({ updatedID: this.changes });
        });
});
 
app.delete("/heroes/:id", (req, res, next) => {
    db.run(`DELETE FROM heroes WHERE id = ?`,
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({ "error": res.message })
                return;
            }
            res.status(200).json({ deletedID: this.changes })
        });
});