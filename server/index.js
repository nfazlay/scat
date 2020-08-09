const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const {addUser, removeUser, getUser, getUserInRoom} = require('./users.js')

const PORT = process.env.PORT || 5000;

const router  = require('./Router/router')

const app = express();
const server = http.createServer(app);
const io = socketio(server);


io.on('connection', (socket) =>{

    socket.on('join', ({name, room}, callback)=> {
        const {error, user} = addUser({id: socket.id, name, room});

        if(error) return callback(error);

        socket.emit('message', {user: 'admin', text: `Hello ${user.name.charAt(0).toUpperCase() + name.slice(1)}, welcome to the room ${user.room.charAt(0).toUpperCase() + room.slice(1)}`});
        socket.broadcast.to(user.room).emit('message', {user:'admin', text: `${user.name.charAt(0).toUpperCase() + name.slice(1)} has joined.`});

        socket.join(user.room);

        io.to(user.room).emit('roomData', {room: user.room, users: getUserInRoom(user.room.charAt(0).toUpperCase() + name.slice(1))})

        callback();
    });

    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {user: user.name, text: message})
        io.to(user.room).emit('roomData', {room: user.room, users: getUserInRoom(user.room)})
    } );

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left.`})
        }
    })
});


app.use(router);

server.listen(PORT, () => console.log(`Server has started on ${PORT}`));
