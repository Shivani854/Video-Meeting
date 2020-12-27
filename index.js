const express = require('express')
const app = express()
const { ExpressPeerServer } = require('peer');
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.enable('trust proxy')
const peerServer = ExpressPeerServer(server, {
  path: '/'
});

app.use('/peer', peerServer);
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render(`index`)
})

app.get('/start', (req, res) => {
  let uid=uuidV4();
  console.log(uid)
  res.redirect(`/${uid}`)
})

app.get('/:room', (req, res) => {
  res.render('home', { roomId: req.params.room })
})
app.use(express.static("views"));

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||3000)