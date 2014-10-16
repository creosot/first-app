var http = false, tcp = false;
if ( process.argv.length > 2 ) {
    process.argv.forEach(function (val, index, array) {
        switch(val)
        {
            case "http":
                http = true;
                break;
            case "tcp":
                tcp = true;
                break
        }
    });
} else {
    http = true;
    tcp = true;
}

// HTTP stuff
if ( http ) {
    var http_port = process.env.PORT || 5000;
    var express = require('express');
    var app = express();

    app.get('/', function (req, res) {
        res.send('Socket: Hello World!');
    });
    var server = app.listen(http_port, function () {
        console.log('HTTP server on port ' + http_port)
    });

    /*var http_port = process.env.PORT || 5000;
    var express = require('express'), app = express()
        , http = require('http')
        , server = http.createServer(app)
        , jade = require('jade');
    var sockjs = require('sockjs');
    var chatSocket = sockjs.createServer();
    chatSocket.installHandlers(server, {prefix:'/chat'});
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set("view options", { layout: false });
    app.configure(function() {
        app.use(express.static(__dirname + '/public'));
    });
    app.get('/', function(req, res){
        var tcpURI = null;
        if ( tcp ) {
            tcpURI = process.env.RUPPELLS_SOCKETS_FRONTEND_URI;
        }
        res.render('home.jade', { 'tcpURI': tcpURI });
    });
    server.listen(http_port);
    console.log("HTTP listening on " + http_port);
    chatSocket.on('connection', function(conn) {
        var name = "HTTP -> " + conn.remoteAddress + ":" + conn.remotePort;
        peeps[name] = {
            'send' : function (message, sender) { conn.write(JSON.stringify({ 'message' : message, 'name' : sender })); }
        };
        conn.write(JSON.stringify({ 'message' : "Welcome " + name, 'name' : "Server"}));
        joined(name);
        conn.on('data', function (message) {
            broadcast(message, name);
        });
        conn.on('disconnect', function () {
            left(name);
        });
        conn.on('data', function(message) {
            conn.write(message);
        });
        conn.on('close', function() {});
    });*/
}
// TCP socket stuff

var myCRC16 = require('./libs/crc.js');
var net = require('net');
var moment = require('moment');
moment.locale('ru');
var im;
var count_record;
var length_records;
var longitude;
var latitude;
var altitude;
var sputnik;
var speed;
var data;
if ( tcp ) {
    var ruppells_sockets_port = process.env.RUPPELLS_SOCKETS_LOCAL_PORT || 1337;
    net.createServer(function (socket) {
        console.log("Connected Client: " + socket.remoteAddress + ":" + socket.remotePort);
        im = '';
        socket.write('helooooo');
        socket.on('data', function(data){
            var buf = new Buffer(data);
            if(im == ''){
                if(buf.length != 17){
                    socket.write('return');
                    return;
                }
                im = buf.toString('ascii', 2, 17);
                console.log('IMEI: ' + im);
                socket.write('\x01');
            }
            else{
                if(buf.readUInt32BE(0) != 0 || buf.readUInt8(8) != 8){
                    console.log('bad AVL packet');
                    return;
                }
                count_record = buf.readUInt8(9);
                if(count_record != buf.readUInt8(buf.length - 5)){
                    console.log('difference count record');
                    return;
                }
                length_records = buf.readUInt32BE(4) - 3;
                if(length_records != (buf.length - 15)){
                    console.log('difference length record');
                    return;
                }
                var length_rec = (length_records/count_record);
                if(length_rec%1 !== 0){
                    console.log('length record is float' + length_rec);
//                    return;
                }
                longitude = buf.readUInt32BE(19)/10000000;
                latitude = buf.readUInt32BE(23)/10000000;
                altitude = buf.readUInt16BE(27);
                sputnik = buf.readUInt8(31);
                speed = buf.readUInt16BE(32);
                var unix_time = parseInt(buf.toString('hex', 10, 18), 16);
                var timestamp = new moment(unix_time).format('MMMM Do YYYY, H:mm:ss');
                console.log('timestamp record: ' + timestamp);
                console.log("length records: " + length_records);
                console.log("count record: " + count_record);
//                console.log('length 1 record: ' + length_rec);
//                console.log("Широта: " + latitude + "; Долгота: " + longitude + '; Высота: ' + altitude + '; Спутники: ' + sputnik + '; Скорость :' + speed);
//                console.log(buf);
                console.log('CRC tracker: ' + buf.toString('hex', buf.length-4, buf.length) + ' = ' + myCRC16(buf.slice(8, buf.length-4)) + ' :My CRC');
//                  console.log('My CRC: ' + myCRC16(buf.slice(8, buf.length-4)));
//                console.log('buf length: ' + buf.length);
                console.log('socket read byte: ' + socket.bytesRead);
                var res = buf.slice(9,10);
                socket.write('\x00' + '\x00' + '\x00' + res);
                data = new Array(count_record);
                for(var i = 0; i < count_record; i++){
// data[i] = buf.slice(10 + (i*length_rec), 10 + length_rec + (i*length_rec));
                    data[i] = buf.toString('hex', 10 + (i*length_rec), 10 + length_rec + (i*length_rec));
                    console.log(i + ': ' + data[i]);
                }
            }
        });
        socket.on('end', function() {
            console.log('server disconnected');
        });
    }).listen(ruppells_sockets_port);
    console.log("TCP listening on " + ruppells_sockets_port);
}
//function cleanInput(data) {
//    return data.toString().replace(/(\r\n|\n|\r)/gm,"");
//}
