var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var connection = require('../mysql.config');
var r = require('jsrsasign');
var fs = require('fs');
var md = new r.KJUR.crypto.MessageDigest({"alg": "md5", "prov": "cryptojs"});

connection.connect(function(err) {
  if (err) {
    console.error('[ERR:]MYSQL Connection: ' + err.stack);
    return;
  }

  console.log('[INFO:]MYSQL connected as id: ' + connection.threadId);
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/create_user', function(req, res, next){
    console.log("[DEBUG:]create_user");
    var query = "INSERT INTO ?? (??,??,??,??) VALUES(?,?,?,?);"

    var strong = 1000;
    salt = new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
    var md = new r.KJUR.crypto.MessageDigest({"alg": "sha1", "prov": "cryptojs"});

    md.updateString(req.body.password);
    md.updateString(salt);
    var password_hash = md.digest();
    var table = ["android_tutorial", "user_name", "user_id", "password_hash", "salt", req.body.user_name, req.body.user_id, password_hash, salt ];

    query = mysql.format(query,table);

    connection.query(query,function(err,rows){
        if(err) {
            console.log("[ERR]MYSQL:", err);
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        }else{
            console.log("[MYSQL]:", rows);
            res.json({"Error" : false, "Message" : "Success", "Rsult" : rows});
        }
    });
});


router.get('/:user_id', function(req, res, next){
    console.log("[DEBUG:]request",req);
    console.log("[DEBUG:]reference");
    var query = "SELECT * FROM ?? WHERE ?? = ?";
    var table = ["android_tutorial","user_id", req.params.user_id];
    query = mysql.format(query,table);

    connection.query(query,function(err,rows){
        if(err) {
            console.log("[ERR]MYSQL:", err);
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        }else{
            console.log("[MYSQL]:", rows);
            res.json({"Error" : false, "Message" : "Success", "Users" : rows});
        }
    });
});

router.post('/login', function(req, res, next){
    console.log("[DEBUG:]request",req.body);
    console.log("[DEBUG:]login");
    var query = "SELECT ?? FROM ?? WHERE ?? = ?";
    var table = ["salt", "android_tutorial","user_id", req.body.user_id];
    query = mysql.format(query,table);
    console.log("[DEBUG:]Query is:", query);
    connection.query(query,function(err,rows){
        if(rows[0] == null) {
            console.log("[ERR]MYSQL:", err);
            res.json({"Error" : true, "Message" : "Confirm UserID or Password"});
        }else{
            console.log("[DEBUG:]rows:", rows);
            var salt = rows[0].salt;

            var md = new r.KJUR.crypto.MessageDigest({"alg": "sha1", "prov": "cryptojs"});
            md.updateString(req.body.password);
            md.updateString(salt);
            var password_hash = md.digest();

            var query = "SELECT ??,?? FROM ?? WHERE ?? = ? AND ?? = ?";
            var table = ["user_id", "user_name", "android_tutorial","user_id", req.body.user_id, "password_hash", password_hash];
            query = mysql.format(query,table);
            console.log("[DEBUG:]Query is:", query);
            connection.query(query,function(err,rows){
                if(rows[0] == null) {
                     console.log("[ERR]MYSQL:", err);
                     res.json({"Error" : true, "Message" : "Confirm UserID or Password"});
                 }else{
                     console.log("[MYSQL]:", rows);
                     res.json({"Error" : false, "Message" : "Success", "Users" : rows});
                 }
            });
        }
    });
});

module.exports = router;
