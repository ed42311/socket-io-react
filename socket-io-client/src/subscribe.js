import socketIOClient from "socket.io-client";
const  socket = socketIOClient('http://127.0.0.1:4001');

function sendMessage(messageToSend) {
  console.log("send message")
  socket.emit('message', messageToSend)
}

function join(cb) {
  socket.on('join', data => cb(null, data));
}

function playPresses(cb) {
  console.log("send presses on")
  socket.on('otherPresses', data => cb(null, data));
}

function sendPresses(data) {
  console.log("send presses emit")
  socket.emit('presses', data);
}

// function listenForHi(cb){
//   console.log("hi everyone should be called")
//   socket.on('hi', data =>  (null, data))
// }

export { socket, join, sendMessage, playPresses, sendPresses };