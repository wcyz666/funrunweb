#!/bin/env node
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var utils = require('./my_modules/utils');
var path = require('path');
var handlebars = require('express-handlebars').create({});
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var md5 = require('md5');

var roomList = {};

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : "FUNRUNWEB"
});
connection.connect();

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.engine("handlebars", handlebars.engine);
app.set("view engine", 'handlebars');
app.use(cookieParser())
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use( express.static( __dirname + '/public' ) );



app.get('/', function(req, res){

    var i = 0;
    if (req.cookies.id){
        var sql = "SELECT * FROM user WHERE cookie = ?";
        var inserts = [req.cookies.id];
        sql = mysql.format(sql, inserts);
        connection.query(sql, function(err, rows, fields) {
            if (err) throw err;
            if (rows.length > 0)
                res.end("aaaaa");
            else {
                res.cookie("id", "aaaa",{maxAge: -10000});
                res.render("login", {state: true});
            }
        });
    }
    else {
        res.cookie("id", "aaaa",{maxAge: 1000 * 86400});
        res.render("login", {state: true});
    }
});

app.get("/login", function(req, res){
    res.redirect("/");
});

app.post('/login', function (req, res) {
    var pwdhash,
        cookie,
        sql = "",
        inserts = [];
    if (req.body.username && req.body.password){
        pwdhash = md5(req.body.username + req.body.password);
        sql = "SELECT * FROM user WHERE password = ?";
        inserts = [pwdhash];
        sql = mysql.format(sql, inserts);
        //console.log(sql);
        connection.query(sql, function(err, rows, fields) {
            if (err) throw err;
            if (rows.length > 0) {
                cookie = md5(Math.random() + "");
                sql = "UPDATE user SET cookie = ? WHERE password = ?";
                inserts = [cookie, pwdhash];
                sql = mysql.format(sql, inserts);
                connection.query(sql, function(){
                    res.cookie("id", cookie, {maxAge: 1000 * 86400});
                    res.end("aaaa");
                });
            }
            else {
                res.render("login", {state: false});
            }
        });
    }
    else {
        res.render("login", {state: false});
    }
});

/* GET users listing. */
app.get('/init', function(req, res) {
    connection.connect();
    connection.query('CREATE DATABASE funrunweb', function(err, rows, fields) {
    });
    connection.query('CREATE TABLE user (id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL, username CHAR(20) NOT NULL,' +
    'password CHAR(40) NOT NULL, cookie CHAR(40), score INTEGER)', function(err, rows, fields) {
        if (err) throw err;
    });
    
    connection.end();
});

/* GET users listing. */
app.all('/session/:id([0-9]+)', function(req, res) {
    currentRooms.push(req.params.id);
    res.sendFile( path.resolve(__dirname + '/views/index.html') );
});

app.use(function (req, res) {
    res.status(404);
    res.send("Not Found");
});

var server = app.listen( server_port, server_ip_address, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port)

});
