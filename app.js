//var myCRC16 = require('./libs/crc.js');
var net = require('net');
var status_con = 0;
var spy_socket = net.createConnection(62500, 'socket.biglogger.ru', function(){
    console.log("connected")
});
spy_socket.on('data', function(data){
    var buf = new Buffer(data);
    console.log('length buf = ' + buf.length);
    console.log(buf.toString('hex'));
    if(status_con == 0 && data.toString().indexOf('enter name socket') != -1){
        spy_socket.write('spy');
        status_con = 1;
    }
});
spy_socket.on('end', function() {
    status_con = 0;
    console.log('client disconnected');
});


//var moment = require('moment');
//moment.locale('ru');
//var im;
//var count_record;
//var length_data_packet;
//var longitude;
//var latitude;
//var altitude;
//var sputnik;
//var speed;
/*var data;
var number = 0;
var spy = 0;
var events = require('events');
var emiter  = new events.EventEmitter();
var ruppells_sockets_port = process.env.RUPPELLS_SOCKETS_LOCAL_PORT || 1337;
net.createServer(function (socket) {
        console.log("Connected Client: " + socket.remoteAddress + ":" + socket.remotePort);
        im = undefined;
        emiter.on('all_close', function(){
            console.log('close ' + socket.id + ' socket');
            socket.end();
            spy = 0;
        });
        socket.on('close', function(){
            if(socket.id == 'spy'){
                console.log(socket.id + ' close');
                emiter.emit('all_close');
            }
        });
        emiter.on('buf_gps', function(data){
            if(socket.id == 'spy'){
                socket.write(data.toString('ascii'));
                //console.log('data to socket ' + socket.id + ' = ' + data)
            }
        });
        emiter.on('messages', function(data){
            if(socket.id == 'spy'){
                socket.write('\r\n' + data);
            }
        });
        if(spy == 0){
            socket.write('enter name socket:\r\n')
        }
        socket.on('data', function(data){
            var buf = new Buffer(data);
            if(spy != 0) {
                if (socket.id == 'spy') {
                    console.log(data);
                }
                else {
                    if (im === undefined) {
                        emiter.emit('messages', 'undefined socket connecting');
                        if (buf.length != 17) {
                            socket.end();
                            emiter.emit('messages', 'bad IMEI');
                            return;
                        }
                        im = buf.toString('ascii', 2, 17);
                        socket.id = 'gps';
                        console.log('IMEI: ' + im);
                        emiter.emit('messages', 'IMEI: ' + im);
                        socket.write('\x01');
                    }
                    else{
                        var res = buf.slice(9, 10);
                        socket.write('\x00' + '\x00' + '\x00' + res);
                        emiter.emit('messages', socket.id + ': length buf: ' + buf.length + '\r\n');
                        emiter.emit('buf_gps', buf);
                    }
                }
            }
            else{
                if(buf.toString('ascii',0,3) == 'spy'){
                    spy = 1;
                    socket.id = 'spy';
                    socket.write(socket.id + ' socket listen\r\n');
                    console.log('spy socket connected');
                }
                else{
                    console.log('socket not spy');
                    socket.end();
                }
            }
        });
*//*        emiter.on('buf', function(buf){
            if(socket.id == 'spy'){
                socket.write(buf);
                console.log(buf);
            }
        });*//*

        *//*emiter.on('console', function(socet_id){
            console.log('my id=' + socet_id);
        });*//*


        *//*socket.on('data', function(data){
            var buf = new Buffer(data);
            if(im === undefined){
                if(buf.length != 17){
                    socket.end('socket.end, bad imei\r\n');
                    return;
                }
                im = buf.toString('ascii', 2, 17);
                console.log('IMEI: ' + im);
                socket.write('\x01');
            }
            else {
                //console.log(buf);
                if (buf.readUInt32BE(0) != 0) {
                    console.log('bad AVL packet, 4 first byte not 0x00');//check 4 first 0x00 byte
                    socket.end();
                    return;
                }
                if (buf.readUInt8(8) != 8) {
                    console.log('bad AVL packet, number codec not 08');//check codec number
                    socket.end();
                    return;
                }
                count_record = buf.readUInt8(9);
                if (count_record != buf.readUInt8(buf.length - 5)) {
                    console.log('difference count record');// check numbers records 1 and numbers records 2
                    socket.end();
                    return;
                }
                length_data_packet = buf.readUInt32BE(4);
                if (length_data_packet != (buf.length - 12)) {
                    console.log('difference length record');
                    socket.end();
                    return;
                }
                var length_rec = ((length_data_packet - 3) / count_record);
                if (length_rec % 1 !== 0) {
                    console.log('length record is float' + length_rec);
//                    return;
                }
                longitude = buf.readUInt32BE(19) / 10000000;
                latitude = buf.readUInt32BE(23) / 10000000;
                altitude = buf.readUInt16BE(27);
                sputnik = buf.readUInt8(31);
                speed = buf.readUInt16BE(32);
                var unix_time = parseInt(buf.toString('hex', 10, 18), 16);
                var timestamp = new moment(unix_time).format('MMMM Do YYYY, H:mm:ss');
                console.log('timestamp record: ' + timestamp);
                console.log("length records: " + length_data_packet);
                console.log("count record: " + count_record);
//                console.log('length 1 record: ' + length_rec);
//                console.log("Широта: " + latitude + "; Долгота: " + longitude + '; Высота: ' + altitude + '; Спутники: ' + sputnik + '; Скорость :' + speed);
//                console.log(buf);
                console.log('CRC tracker: ' + buf.toString('hex', buf.length - 4, buf.length) + ' = ' + myCRC16(buf.slice(8, buf.length - 4)) + ' :My CRC');
//                  console.log('My CRC: ' + myCRC16(buf.slice(8, buf.length-4)));
//                console.log('buf length: ' + buf.length);
                console.log('socket read byte: ' + socket.bytesRead);
                var res = buf.slice(9, 10);
                socket.write('\x00' + '\x00' + '\x00' + res);
                data = new Array(count_record);
                for (var i = 0; i < count_record; i++) {
                // data[i] = buf.slice(10 + (i*length_rec), 10 + length_rec + (i*length_rec));
                    data[i] = buf.toString('hex', 10 + (i * length_rec), 10 + length_rec + (i * length_rec));
                    console.log(i + ': ' + data[i]);
                }
            }
        });*//*
        socket.on('end', function() {
            console.log('client disconnected');
        });
    }).listen(ruppells_sockets_port, function(){console.log("TCP listening on " + ruppells_sockets_port)});
}*/

//function cleanInput(data) {
//    return data.toString().replace(/(\r\n|\n|\r)/gm,"");
//}
