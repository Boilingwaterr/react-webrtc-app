import openSocket from 'socket.io-client';
import openSocket from 'socket.io-client';

//let socket = io.connect();
const socket = openSocket('http://localhost:8000');

export const socketIO = (roomName) => {
    let obj;
    socket.emit('create or join room', (roomName));

    socket.on('createdRoom', str => {
        obj = JSON.parse(str);
        console.log(obj)
        return obj;
    })

    socket.on('join', (roomName, numOfClients) => {
        console.log(`Another user was connected to room: ${roomName}, number of useres: ${numOfClients}`);
    });

    socket.on('log', logArray => {
        console.log.apply(console, logArray);
    });

    socket.on('new', message => {
        let json = JSON.parse(message);
        console.log(json);
    })
}

// let numOfClients, toPeer, myID;
// let room = 'Room_one';
// let myInfo = { 'id': myID, 'myColor': alertClass, 'room': room };

// if (room !== '') {
//     socket.emit('create or join', room, JSON.stringify(myInfo));
//     console.log(`Attempted to create or join room: ${room}`);
// }
// socket.on('created', (room) => {
//     console.log(`Created room: ${room}.`);
// });

// socket.on('full', (room) => {
//     console.log(`Room ${room} is full`);
// });



// socket.on('join', (room, numClients) => {
//     isInitiator = true;
//     numOfClients = numClients;
//     console.log(`Another peer made a request to join room ${room}.`);
//     console.log(`This peer is the initiator of room ${room}.`);
//     isChannelReady = true;
//     maybeStart();
// });

// socket.on('joined', (room, socket_id) => {
//     myID = socket_id;
//     isChannelReady = true;
//     console.log(`joined to ${room}.`);
// })