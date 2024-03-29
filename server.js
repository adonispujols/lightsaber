var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var shortid = require('shortid');
// var Bitly = require('bitly');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('views'));
app.set('views', __dirname + '/views');

var rooms = [];
// var bitly = new Bitly('e7d67277347e7c7b79b591cafa422a22e9a380fb');

app.get('/', function (req, res) {
	var room = shortid.generate();
    	let room_url = 'https://'+req.headers.host+'/lightsaber/'+room;
    	res.render('viewer', {room: room, roomURL: room_url});
    	rooms.push(room);
});

app.get('/lightsaber/:roomId', function (req, res){
	res.render('lightsaber', {room: req.params.roomId});
});

var port = process.env.PORT || 3000;
server.listen(port, function(req, res){
	console.log("Listening on "+port);
});

io.on('connection', function (socket) {

/*
- GET /viewer
- Generate ROOM ID and render it on page.
- VIEWER joins socket room with ROOM ID.

- GET /lightsaber
- Input ROOM ID from VIEWER
- LIGHTSABER joins socket room with ROOM ID
	- SERVER tells VIEWER and LIGHTSABER to begincalibration
- LIGHTSABER tells SERVER that calibrationcomplete
	- SERVER tells VIEWER that calibrationcomplete
- VIEWER tells SERVER that viewerready
	- SERVER tells LIGHTSABER that viewerready
- LIGHTSABER tells SERVER sendmotion with data
	- SERVER tells VIEWER motionupdate with data
*/

	socket.on('viewerjoin', function(data){
		socket.room = data.room;
		socket.join(socket.room);

		console.log("Viewer joined: "+socket.room);
	});

	socket.on('lightsaberjoin', function(data){
		socket.room = data.room;
		socket.join(socket.room);

		io.sockets.in(socket.room).emit('beginsetup');

		console.log("Lightsaber joined: "+socket.room);
	});

	socket.on('setupcomplete', function(data){
		socket.broadcast.to(socket.room).emit('setupcomplete');

		console.log("Lightsaber setup complete: "+socket.room);
	});

	socket.on('viewready', function(data){
		socket.broadcast.to(socket.room).emit('viewready');

		console.log("View ready: "+socket.room);
	});

	socket.on('startedGame', function(data){
		socket.broadcast.to(socket.room).emit('beginGame', data);
	});

	socket.on('sendorientation', function(data){
		socket.broadcast.to(socket.room).emit('updateorientation',data);
	});

	socket.on('sendhit', function(data){
		socket.broadcast.to(socket.room).emit('playsound', data);
	});

	socket.on('powerAttack_1', function(data){
		socket.broadcast.to(socket.room).emit('init_powerAttack_1', data);
	});

});
