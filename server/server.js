const express = require('express')
const http = require('http')
const cors = require('cors')
const mongoose = require('mongoose')

const { Server } = require('socket.io')

const app = express()

app.use(cors())

// ✅ MongoDB Connection
mongoose
  .connect(
    'mongodb+srv://gaurangkapil480_db_user:Gaurang23%23@cluster0.kcrycxr.mongodb.net/chatapp?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() =>
    console.log('MongoDB Connected')
  )
  .catch((err) => console.log(err))

// ✅ Message Schema
const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  time: String,
  image: String,
})

// ✅ Message Model
const Message = mongoose.model(
  'Message',
  messageSchema
)

const server = http.createServer(app)

// ✅ Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    methods: ['GET', 'POST'],
  },
})

// ✅ Online Users Array
let onlineUsers = []

// ✅ Load Old Messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find()

    res.json(messages)
  } catch (error) {
    console.log(error)
  }
})

// ✅ Socket Connection
io.on('connection', (socket) => {
  console.log(
    'User Connected:',
    socket.id
  )

  // ✅ JOIN USER
  socket.on('join', (username) => {
    socket.username = username

    // Prevent duplicate users
    if (
      !onlineUsers.includes(username)
    ) {
      onlineUsers.push(username)
    }

    console.log(
      'Online Users:',
      onlineUsers
    )

    // Send online users to everyone
    io.emit(
      'online_users',
      onlineUsers
    )
  })

  // ✅ SEND MESSAGE
  socket.on(
    'send_message',
    async (data) => {
      try {
        // Save in MongoDB
        const newMessage =
          new Message(data)

        await newMessage.save()

        // Send message to ALL users
        io.emit(
          'receive_message',
          data
        )
      } catch (error) {
        console.log(error)
      }
    }
  )

  // ✅ TYPING INDICATOR
  socket.on('typing', (name) => {
    socket.broadcast.emit(
      'user_typing',
      name
    )
  })

  // ✅ DISCONNECT USER
  socket.on('disconnect', () => {
    console.log(
      'User Disconnected:',
      socket.id
    )

    onlineUsers =
      onlineUsers.filter(
        (user) =>
          user !== socket.username
      )

    console.log(
      'Remaining Users:',
      onlineUsers
    )

    // Update everyone
    io.emit(
      'online_users',
      onlineUsers
    )
  })
})

// ✅ Start Server
server.listen(5000, () => {
  console.log(
    'Server Running on port 5000'
  )
})