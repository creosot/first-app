// web.js
/*var express = require("express");
var logfmt = require("logfmt");
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
    res.send('Hello World! treker1');
    console.log("ugggugugugugu");
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
    console.log("Listening on " + port);
});*/

var net = require("net");

var port = Number(process.env.PORT || 3000);
net.createServer(function(socket){
    console.log("client connected!!!! on port" + Number(process.env.PORT));

    socket.on("data", function(data){
        console.log("server receive: " + data.toString("utf8"));
        socket.write(data);
    });

    socket.on("messages", function(messages){
        console.log(messages);
        //socket.write(data);
    });

    socket.on("error", function(ex){
        console.log(ex);
    });
}).
    listen(port, function(){
        console.log("Socket Listening on " + port);
    });