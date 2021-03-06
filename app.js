#!/bin/env node
var express = require('express');
var bodyParser = require('body-parser');
var utils = require('./my_modules/utils');
var handlebars = require('express-handlebars').create({});
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var md5 = require('md5');
var socketIO = require('socket.io');

var app = express();
var io;
app.engine("handlebars", handlebars.engine);
app.set("view engine", 'handlebars');
app.use(cookieParser());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use( express.static( __dirname + '/public' ) );


var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : "FUNRUNWEB"
});


var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '172.30.73.1';
var currentRooms = {};
var onlineUsers = {};

connection.connect();


app.get('/', function(req, res){

    var i = 0;
    if (req.cookies.id){
        if (req.cookies.id in onlineUsers) {
            res.cookie("id", req.cookies.id, {maxAge: 1000 * 86400});
            res.render("me", {
                me : onlineUsers[req.cookies.id].username
            });
        }
        else {
            var sql = "SELECT * FROM user WHERE cookie = ?";
            var inserts = [req.cookies.id];
            sql = mysql.format(sql, inserts);
            connection.query(sql, function(err, rows, fields) {
                if (err) throw err;
                if (rows.length > 0){
                    onlineUsers[req.cookies.id] = {
                        username : rows[0].username,
                        score: rows[0].score,
                        isPlaying: false,
                        currentRoom : -1
                    };
                    res.render("me", {
                        me : onlineUsers[req.cookies.id].username
                    });
                }
                else {
                    res.cookie("id", "",{maxAge: -10000});
                    res.render("login", {state: true});
                }
            });
        }
    }
    else {
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
    if (req.body.username && req.body.password) {
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
                onlineUsers[cookie] = {
                    username : rows[0].username,
                    score: rows[0].score,
                    isPlaying: false,
                    currentRoom : -1
                };
                sql = mysql.format(sql, inserts);
                connection.query(sql, function(){
                    res.cookie("id", cookie, {maxAge: 1000 * 86400});
                    res.render("me",  {
                        me : onlineUsers[cookie].username
                    });
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
    connection.query('CREATE TABLE friend (id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,friend1 INTEGER NOT NULL, friend2 INTEGER NOT NULL)', function(err, rows, fields) {
        if (err) throw err;
    });
    connection.end();
});

app.post('/reg', function(req, res){
    var pwdhash,
        cookie,
        sql = "",
        inserts = [],
        username = req.body.username,
        password = req.body.password;

    if (username && password) {
        pwdhash = md5(username + password);
        cookie = md5(Math.random() + "");
        sql = "INSERT INTO user VALUES (NULL, ?, ?, ?, 0)";
        inserts = [username, pwdhash, cookie];
        sql = mysql.format(sql, inserts);
        console.log(sql);
        connection.query(sql, function(err, rows, fields) {
            if (err) throw err;
            onlineUsers[cookie] = {
                username : username,
                score: 0,
                isPlaying: false,
                currentRoom : -1
            };
            res.cookie("id", cookie, {maxAge: 1000 * 86400});
            res.render("me", {me : username});
        });
    }
    else {
        res.redirect('/reg.html');
    }
});

app.get('/me', function(req, res) {
    console.log(onlineUsers);
    if (!onlineUsers[req.cookies.id])
        res.redirect("/");
    else
        res.render("me", {me : onlineUsers[req.cookies.id].username});
});

app.get('/me/score', function(req, res) {
    var username = onlineUsers[req.cookies.id].username,
        sql,
        inserts;
    sql = "SELECT username, score FROM user ORDER BY score DESC, username ASC";
    //console.log(sql);
    connection.query(sql, function(err, rows, fields) {
        if (err) throw err;
        var i,
            scores = [],
            score;
        for (i = 0; i < rows.length; i++){
            score = {
                username : rows[i].username,
                score : rows[i].score,
                rank : i + 1
            };
            scores.push(score);
        }
        console.log(req.cookies);
        res.render("scores", {me : username, scores: scores});
    });
});

app.get('/logout', function(req, res) {
    res.cookie("id", "", {maxAge: -1000});
    res.render("login", {state : true});
});

app.get('/new', function(req, res, next){
    if (!onlineUsers[req.cookies.id])
        res.redirect("/");
    res.render("me", {me : onlineUsers[req.cookies.id].username});
});

app.post('/new', function(req, res){
    if (!onlineUsers[req.cookies.id]) {
        res.render("login", {state : true});
        return;
    }
    var room = utils.getNewRoom(currentRooms);
    onlineUsers[req.cookies.id].currentRoom = room;
    onlineUsers[req.cookies.id].isPlaying = true;
    currentRooms[room] = {
        roomName : req.body.name,
        roomMap: req.body.map,
        players:
            [onlineUsers[req.cookies.id].username],
        readyPlayers: [],
        arrivedPlayers: [],
        isPlaying: false
    };
    console.log(currentRooms);
    res.redirect("/room/" + room);
});

app.get('/api/roomCount', function(req, res){
    var key,
        count = 0;

    for (key in currentRooms)
        ++count;

    res.json({roomCount : count});
});

app.get('/pick', function(req, res){
    if (!onlineUsers[req.cookies.id]) {
        res.render("login", {state : true});
        return;
    }
    var key,
        roomList = [],
        roomRandom = 0;
        count = 0;
    for (key in currentRooms){
        roomList.push(key);
        count++;
    }
    roomRandom = Math.floor(Math.random() * count);

    roomRandom = roomList[roomRandom];
    onlineUsers[req.cookies.id].currentRoom = roomRandom;
    onlineUsers[req.cookies.id].isPlaying = true;
    if (currentRooms[roomRandom].players.indexOf(onlineUsers[req.cookies.id].username) == -1)
        currentRooms[roomRandom].players.push(onlineUsers[req.cookies.id].username);
    console.log(currentRooms);
    res.redirect("/room/" + roomRandom);
});



/* GET users listing. */
app.all('/room/:id([0-9]+)', function(req, res) {
    console.log(onlineUsers);
    console.log(currentRooms);
    if (!onlineUsers[req.cookies.id]){
        res.redirect("/");
        return;
    }
    if (!currentRooms[req.params.id]) {
        res.render("me", onlineUsers[req.cookies.id].username);
        return;
    }
    if (!onlineUsers[req.cookies.id].isPlaying)
        onlineUsers[req.cookies.id].isPlaying;
    else
        if (onlineUsers[req.cookies.id].currentRoom != req.params.id) {
            res.redirect("/room/" + onlineUsers[req.cookies.id].currentRoom);
            return;
        }
    players = currentRooms[req.params.id].players.slice();

    if (players.indexOf(onlineUsers[req.cookies.id].username) == -1){
        currentRooms[req.params.id].players.push(onlineUsers[req.cookies.id].username);
    }
    else
        players.splice(players.indexOf(onlineUsers[req.cookies.id].username), 1);
    res.render("game", {
        roomInfo: currentRooms[req.params.id],
        players: players,
        me:
            onlineUsers[req.cookies.id]
    });
});

app.get('/room/exit/:id([0-9]+)', function(req, res){
    if (!onlineUsers[req.cookies.id]){
        res.redirect("/");
        return;
    }
    var room = req.params.id;
    onlineUsers[req.cookies.id].currentRoom = -1;
    onlineUsers[req.cookies.id].isPlaying = false;
    if (currentRooms[room]) {
        currentRooms[room].players.splice(currentRooms[room].players.indexOf(onlineUsers[req.cookies.id].username), 1);
        if (currentRooms[room].players.length == 0)
            delete currentRooms[room];
        console.log(currentRooms);
    }
    res.redirect("/me");
});

/* GET users listing. */
app.all('/api/allrooms', function(req, res) {
    if (!onlineUsers[req.cookies.id]){
        res.redirect("/");
        return;
    }
    console.log(currentRooms);
    res.json(currentRooms);
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

io = socketIO(server);
io.on( 'connection', function( socket ) {
    console.log( 'New user connected' );

    socket.on('add', function (data) {
        console.log(data);
        roomList[data.room] = data.playlist;
        socket.broadcast.to(data["room"]).emit('add', data);
    });

    socket.on('remove', function (data) {
        console.log(data);
        roomList[data.room] = data.playlist;
        socket.broadcast.to(data["room"]).emit('remove', data);
    });

    socket.on("join", function(data) {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit("newClient", data.username);
        console.log("join", data);
    });

    socket.on("jump", function(data) {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit("onJump", data);
        console.log("jump", data);
    });

    socket.on("exit", function(data) {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit("exitClient", data.username);
        console.log("exit", data);
    });

    socket.on("ready", function(data) {
        var room = currentRooms[data.room];

        socket.join(data.room);
        if (room.isPlaying)
            return;
        if (room.readyPlayers.indexOf(data.username) == -1)
            room.readyPlayers.push(data.username);
        if (room.readyPlayers.length == room.players.length) {
            io.to(data.room).emit('start', {map : room.map, userNum: room.players.length});
            room.isPlaying = true;
        }
        else
            socket.broadcast.to(data.room).emit("newReady", data.username);
        console.log("ready", data);
        console.log("ready", currentRooms[data.room].readyPlayers);
    });

    socket.on("arrived", function(data) {
        var room = currentRooms[data.room],
            sql,
            inserts,
            i,
            length;

        console.log(data);
        if (room.arrivedPlayers.indexOf(data.username) == -1)
            room.arrivedPlayers.push(data.username);
        if (room.arrivedPlayers.length == room.players.length) {

            io.to(data.room).emit('gameOver', {
                map : room.map,
                userNum: room.players.length,
                winner: room.arrivedPlayers[0]
            });
            sql = "UPDATE user SET score = score + 20 WHERE username = ?";
            inserts = [room.arrivedPlayers[0]];
            sql = mysql.format(sql, inserts);
            
            connection.query(sql, function(){
            });
            for (i = 1; i < length; i++) {
                sql = "UPDATE user SET score = score - 20 WHERE username = ?";
                inserts = [room.arrivedPlayers[i]];
                sql = mysql.format(sql, inserts);
                connection.query(sql, function(){
                });
            }
            delete room;
            io.to(data.room).emit("backToMe", {});
        }
        else
            socket.broadcast.to(data.room).emit("newArrived", data.username);
        console.log("ready", data);
        console.log("ready", currentRooms[data.room].arrivedPlayers);
    });

    socket.on("posSync", function(data){
        socket.join(data.room);
        socket.broadcast.to(data.room).emit("posSync", data.pos);
        console.log("aynclist", data);
    });

    socket.on("prop", function (data) {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit("prop", data);
        console.log("prop", data);
    })

} );