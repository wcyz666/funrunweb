#!/bin/env node
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var utils = require('./my_modules/utils');
var path = require('path');
var handlebars = require('express-handlebars').create({});
var cookieParser = require('cookie-parser')

var roomList = {};

var mysql      = require('mysql');

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
    var connection;

    if (!req.cookies.client){
        res.cookie("id", "helloworld",{maxAge: 1000 * 86400});
    }
    res.render("login", {state: false});
    connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : "FUNRUNWEB"
    });
    connection.connect();
    connection.query('SELECT ', function(err, rows, fields) {
        //console.log('The solution is: ', rows[0].solution);
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
