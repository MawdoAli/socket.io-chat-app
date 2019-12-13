const path = require('path')
const http = require('http'); 
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage}= require('./util/messages')
const {getUser, removeUser, addUser, getUserInRoom}=require('./util/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const myPort = process.env.PORT || 3000
const publicDirectoryPath = path.join(__filename, '../public')

app.use(express.static(publicDirectoryPath))




io.on('connection', (socket)=>{

    console.log('New Websocket connection....')



    socket.on('join', ({username, room}, callback)=>{

        const {error, user}= addUser({id: socket.id, username, room})
        if(error){
           return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has join`))
        
        io.to(user.room).emit('roomData',{

            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })



    socket.on('sendMessage', (messageFromInput, callback )=>{

        const user = getUser(socket.id)

        const filter = new Filter()

        if (filter.isProfane(messageFromInput)){
            return callback('No Profinity')
        }
        
        io.to(user.room).emit('message', generateMessage(user.username, messageFromInput))
        callback()
    })



    socket.on('sendLocation', (position, callback)=>{
        
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage( user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()

    }) 

    

    socket.on('disconnect', ()=>{

        const user = removeUser(socket.id) 
        if(user){
            io.emit('message',generateMessage('Admin', `${user.username}  has left`))

            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })

})


 
server.listen(myPort, ()=>{

    console.log(`My chat-app server is running on port ${myPort}...`)   
})

//console.log(path.join(__dirname, '../public'))
//console.log(path.join(__filename, '../public'))


