const express = require('express');

const port = 3000;
const socketPort = 8000;
const app = express();
const server = require('http').Server(app);


server.listen(port);

app.use('/', express.static(`${__dirname}/build`));
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/build/index.html`);
});

const io = require('socket.io')();
io.listen(socketPort);
console.log('Socket listening on port ', socketPort);
let users = [];

/////////////SOCKETS
let clientsInRoom, numClients;
io.sockets.on('connection', socket => {

    socket.on('auth', userData => {
        let json = JSON.parse(userData);
        json.id = socket.id;
        if (users.length === 0) json.isInitiator = true;
        if (users.length === 1) {
            if (users[0].nick === json.nick)
                json.nick += '(1)';
        }
        console.log(`socket joined : ${json.nick}.`)
        users.push(json);
        socket.emit('auth', JSON.stringify(json));
        if (users.length > 1) {
            socket.emit('authUpdate', JSON.stringify(users))
        }
    })

    socket.on('create or join room', roomName => {
        log(`Received request to create or join room ${roomName}`);
        socket.room = roomName;
        clientsInRoom = io.sockets.adapter.rooms[roomName];
        socket.emit('connected', JSON.stringify({ connected: true, id: socket.id, roomName: socket.room }));

        numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
        log(`Room ${roomName} now has ${numClients} client(s).`);

        //sending other peers about connection new peer
        socket.broadcast.to(socket.room).emit("new", JSON.stringify(socket.id));
        socket.on('new', payload => {
            socket.broadcast.to(socket.room).emit("toPeer", JSON.stringify(payload));
        })
        if (numClients === 0) {
            socket.join(socket.room); //user join to room
            clientsInRoom = io.sockets.adapter.rooms[roomName];
            log(`Client id: ${socket.id} created room: ${roomName}.`);
            socket.emit('initiator', JSON.stringify({ roomName, userId: socket.id, type: 'initiator' }));

        } else if (numClients < 2) {
            log(`Client id: ${socket.id} joined room ${roomName}.`);
            socket.join(socket.room); //user join to room
            // sending to all clients in room(channel), include sender.
            io.in(socket.room).emit('joined users', JSON.stringify({ roomName, numClients, clientsInRoom, users }));
            //
            io.sockets.in(socket.room).emit('ready');
        } else {
            socket.emit('full', roomName);
            log(`Room ${roomName} is full.`);

        } // max 2 clients.
    });

    function log() {
        let logArray = ['Message from server: '];
        logArray.push.apply(logArray, arguments);
        socket.emit('log', logArray);
    }


    socket.on('message', (message, userInfo) => {
        let json = JSON.parse(userInfo);
        //
        let sender = json.myId;
        let recipient = json.toPeer;
        let roomName = json.roomName;
        let newJson = { roomName, sender, recipient };
        //
        log('Client said: ', message);
        socket.room = json.room;
        socket.user_id = json.myId;

        if (json.toPeer !== undefined) { //if we have target
            socket.broadcast.to(json.toPeer).emit('message', message, JSON.stringify(newJson));
        }

    });
    socket.on('disconnect', () => {
        let disconnectedArray = users.filter(item => {
            return item.id !== socket.id;
        })
        console.log('socket.id', socket.id);
        users = disconnectedArray;
        io.in(socket.room).emit('user disconnected', JSON.stringify({ clientsInRoom, users }));

        console.log('received bye', users);
    });
});
