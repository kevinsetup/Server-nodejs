const express = require('express');
const socketio = require('socket.io');
const router = require('./routes')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./users')
const cors = require('cors');


const app = express();
app.use(router);
app.use(cors('https://frontedparaelchat.herokuapp.com/'))
//Port
const PORT = process.env.PORT  || 5500


//Init Server
const server = app.listen(PORT,() =>{
    console.log("Server running on port 5500")
})
//sockets
const io = socketio(server);
io.on('connection', (socket) =>{
    console.log('New connection!!!!')

    socket.on('join', ({name, room}, callback) =>{
        const {error, user} = addUser({id : socket.id, name ,room});
     
        if(error) return callback(error);
        socket.emit('message', {
            user : 'admin',
            text :  `${user.name}, Holaaaa, bienvenido al chat ${user.room}`

        })
        socket.broadcast.to(user.room).emit('message', {user : 'admin', text : `${user.name} se ha unido!`});


        socket.join(user.room)
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)  })
        //io.to(user.room).emit('roomData', {room : user.room, users: getUsersInRoom(user.room)});

                callback();

    })
 
    socket.on('Typing', (socket, users) =>{
        socket.broadcast.emit('Typing', {users})
    })
  

    socket.on('sendMessage', (message,callback) =>{
        try {
            const user = getUser(socket.id);
            io.to(user.room).emit('message', {user : user.name, text : message});
            callback();
        } catch (error) {
            console.log(error);
        }
      

    })

    socket.on('disconnect', () =>{
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)  })
            io.to(user.room).emit(
                'message', 
                {
                 user : 'admin',
                 text : `${user.name} se fue` 
                })
        }
       

    });

})


