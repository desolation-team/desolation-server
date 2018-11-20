const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
	console.log(`Desolation WebSocket server is running on ${PORT}.`);
});

const connections = [];
let amountOfPlayers = 0;

io.on('connection', socket => {
	socket.index = ++amountOfPlayers;
	connections.push(socket);
	setListeners(socket);
});

function setListeners(socket) {
	socket.on('new player', data => {
		io.emit('receive message', { type: 'connect', nickname: data.nickname });
		socket.playerData = Object.assign({}, data, { index: socket.index });
		const filteredConnections = connections.filter(connection => connection.index !== socket.index);
		filteredConnections.forEach(connection => connection.emit('create player', socket.playerData));
		filteredConnections.map(player => player.playerData)
			.forEach(data => socket.emit('create player', data));
	});

	socket.on('enemy hitted', data => {
		connections.filter(connection => connection.index !== socket.index)
			.forEach(connection => connection.emit('hit player', data));
	});

	socket.on('enemy death', data => {
		io.emit('receive message', { type: 'death', nickname: data.enemyName, killer: data.killer });
		connections.filter(connection => connection.index !== socket.index)
			.forEach(connection => connection.emit('kill player', data));
	});

	socket.on('move', data => {
		socket.playerData = Object.assign({}, data, { index: socket.index });
		connections.filter(connection => connection.index !== socket.index)
			.forEach(connection => connection.emit('update player', socket.playerData));
	});

	socket.on('send message', data => {
		connections.forEach(connection => connection.emit('receive message', { type: 'message', nickname: data.nickname, text: data.text }));
	});

	socket.on('disconnect', () => {
		io.emit('remove player', socket.index);
		socket.playerData && socket.playerData.nickname && io.emit('receive message', { type: 'disconnect', nickname: socket.playerData.nickname });
		connections.splice(connections.findIndex(connection => connection.index === socket.index), 1);
	});
}
