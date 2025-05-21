const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });

let rooms = {};

io.on('connection', socket => {
  socket.on('joinRoom', ({ room, username }) => {
    socket.join(room);
    socket.room = room;
    socket.username = username;

    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(username);

    io.to(room).emit('message', {
      username: 'System',
      text: `${username} joined the classroom`
    });
  });

  socket.on('leaveRoom', () => {
    if (socket.room && rooms[socket.room]) {
      rooms[socket.room] = rooms[socket.room].filter(name => name !== socket.username);
      io.to(socket.room).emit('message', {
        username: 'System',
        text: `${socket.username} left the classroom`
      });
      socket.leave(socket.room);
    }
  });

  socket.on('chatMessage', msg => {
    io.to(socket.room).emit('message', {
      username: socket.username,
      text: msg
    });
  });

  socket.on('fileUpload', file => {
    io.to(socket.room).emit('file', {
      username: socket.username,
      file
    });
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ path: `/uploads/${req.file.filename}`, filename: req.file.originalname });
});

http.listen(3000, () => {
  console.log('Server running on port 3000');
});
