const mysql = require('mysql')
const express = require('express')
const app = express()

const routes = require('./routes')
const session = require('cookie-session');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const ent = require('ent');

const {
  userJoin,
  getCurrentUser,
  allAssignement,
  userLeave,
  retrieve
} = require('./public/js/users');

app.use(session({
    secret: 'matchatoken',
    maxAge: 2 * 24 * 60 * 60 * 1000 // 2 jours
  }));

app.use(express.static('public'));


// interactions avec les clients via la librairie socket.io
io.sockets.on('connection', function (socket) {
  socket.on('assign_nickname', current_user => {
    const current = allAssignement(socket.id, current_user);
    socket.join(current.current_user)
  });

  socket.on('new_view', (data) => {
    const view = retrieve(data.parent)
    if(view)
      io.to(view.id).emit('new_view', {nick: data.current_firstname });
  });
  socket.on('new_like', (data) => {
    const like = retrieve(data.parent)
    if(like)
      io.to(like.id).emit('new_like', {nick: data.current_firstname });
  });
  socket.on('new_match', (data) => {
    const match = retrieve(data.parent)
    if(match)
      io.to(match.id).emit('new_match', {nick: data.current_firstname });
  });
  socket.on('unmatch', (data) => {
    const unmatch = retrieve(data.parent)
    if(unmatch)
      io.to(unmatch.id).emit('unmatch', {nick: data.current_firstname });
  });
  socket.on('new_msg', (data) => {
    const msg = retrieve(data.parent)
    if(msg)
      io.to(msg.id).emit('new_msg', {nick: data.current_firstname });
  });



  socket.on('new_client', function(pseudo) {
    pseudo = ent.encode(pseudo);
    socket.pseudo = pseudo;
    socket.broadcast.emit('new_client', pseudo);
  });
  socket.on('joinRoom', ({ room }) => {
    const user = userJoin(socket.id, room)
    
    socket.join(user.room)
  });
  // Listen for chatMessage
  socket.on('newMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('newMessage', {pseudo: socket.pseudo, message: msg});
  });


  socket.on('disconnect', () => {
    userLeave(socket.id);
  });

});

//EJS

app.set('views', './views')
app.set('view engine', 'ejs')

app.use('/', routes);

app.use(function(req,res){
  res.status(404).render('errors');
});

module.exports = app;

server.listen(3000, function() {
    console.log("Server listening on port: 3000");
})