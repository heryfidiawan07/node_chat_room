var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var users = {};
var usernames = [];

io.on('connection', function(socket){
	//kalo ada yang bergabung ke obrolan
	socket.broadcast.emit('newMessage', 'ada yang bergabung');
	//ketika ada user yang daftar
	socket.on('registerUser', function(username){
		if (usernames.indexOf(username) != -1) {
			socket.emit('registerRespond', false);
		}else {
			users[socket.id] = username;
			usernames.push(username);
			socket.emit('registerRespond', true);
			io.emit('onlineUsers', usernames);
			//console.log(users);
			//console.log('-----------------');
			//console.log(username);
		}
	});
	//kalo ada message baru
	socket.on('newMessage', function(msg){
		io.emit('newMessage', msg);
		//console.log('Chat baru:'+msg); untuk mengeluarkan di console
	});
	//kalo user mengetik
	socket.on('newTyping', function(msg){
		socket.broadcast.emit('newTyping', msg);
	});
	//user kalo disconnect
	socket.on('disconnect', function(msg){
		socket.broadcast.emit('newMessage', 'meninggalkan obrolan');
		var index = usernames.indexOf(users[socket.id]);
		usernames.splice(index, 1);
		delete users[socket.id];
		io.emit('onlineUsers', usernames);
	});
});

http.listen(3000, function(){
	console.log('Listening on 3000......');
});