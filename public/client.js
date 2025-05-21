const socket = io();
let currentRoom = '';

function joinRoom() {
  const username = document.getElementById('username').value;
  const room = document.getElementById('room').value;

  if (!username || !room) return alert("Fill both fields");

  socket.emit('joinRoom', { room, username });
  currentRoom = room;

  document.getElementById('joinPage').style.display = 'none';
  document.getElementById('classroomPage').style.display = 'block';
  document.getElementById('roomHeader').textContent = `Classroom: ${room}`;
}

function leaveRoom() {
  socket.emit('leaveRoom');
  location.reload();
}

function sendMessage() {
  const msg = document.getElementById('message').value;
  if (msg.trim()) {
    socket.emit('chatMessage', msg);
    document.getElementById('message').value = '';
  }
}

socket.on('message', msg => {
  const chat = document.getElementById('chat');
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<strong>${msg.username}:</strong> ${msg.text}`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  fetch('/upload', {
    method: 'POST',
    body: formData
  }).then(res => res.json())
    .then(data => {
      socket.emit('fileUpload', data);
    });

  fileInput.value = '';
}

socket.on('file', data => {
  const chat = document.getElementById('chat');
  const div = document.createElement('div');
  div.classList.add('message');

  const ext = data.file.filename.split('.').pop().toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
    div.innerHTML = `<strong>${data.username}:</strong><br><img src="${data.file.path}" style="max-width:200px" />`;
  } else {
    div.innerHTML = `<strong>${data.username}:</strong><br><a href="${data.file.path}" target="_blank">${data.file.filename}</a>`;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});
