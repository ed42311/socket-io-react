import socketIOClient from "socket.io-client";
const  socket = socketIOClient(`https://limitless-basin-51119.herokuapp.com/` + process.env.PORT);

function sendMessage(messageToSend) {
  socket.emit('message', messageToSend)
}

function join(cb) {
  socket.on('join', data => cb(null, data));
}

function playPresses(cb) {
  socket.on('otherPresses', data => cb(null, data));
}

function sendPresses(data) {
  socket.emit('presses', data);
}

export { socket, join, sendMessage, playPresses, sendPresses };