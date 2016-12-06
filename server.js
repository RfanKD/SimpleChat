// var http = require ("http"),

// server = http.createServer(function(req, res) {
//     res.writeHead(200, {
//         'Content-Type': 'text/plain'
//     });

//     res.write("hello world!");
//     res.end();
// });

var express = require('express');
var app = express();
var server = require ('http').createServer(app);
var io = require('socket.io').listen(server);

var users = [] ;

app.use('/', express.static('www'));

server.listen(80);
console.log("server started");

io.on('connection',function(socket){

    socket.on('login', function(nickname){

        console.log("server received "+ nickname);

        if(users.indexOf(nickname)> -1){
            socket.emit('nickExisted');
        }else {
            socket.userIndex = users.length;
            socket.nickname = nickname ;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });

    socket.on('img', function(imgData, color){
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });

    socket.on('disconnect', function(nickname){
        
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });

    socket.on('postMsg', function(msg, color){
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });

});