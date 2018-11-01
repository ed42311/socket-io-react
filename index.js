const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io", {
  transports  : [ 'xhr-polling' ],
  'polling duration' : 10
})
const axios = require("axios");
const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const io = socketIo(server); 

class DataStore {
  constructor(io){
    this.io = io
    this.games = []
    this.num = 0
  }

  addNewGame(game) {
    this.games.push(game)
  }

  removeEmptyGames() {
    this.games = this.games.filter(game => !(game.player1 === null && game.player2 === null))
  }

  getGameByPlayerId(id) {
    const { games } = this
    for (let i = 0; i < games.length; i++) {
      let counter = 1
      while(counter <= 2) {
        let player = `player${counter}`
        if(games[i][player].getSocketId() === id) {
          return games[i]
        } 
        counter++
      }
    }
  }

  removePlayerWith(id) {
    const { games } = this
    for (let i = 0; i < games.length; i++) {
      let counter = 1
      while(counter <= 2) {
        let player = `player${counter}`
        if(games[i][player].getSocketId() === id) {
          games[i][player] = null
          games[i].updateStatus()
          break
        } 
        counter++
      }
    }
  }

  getGameNum() {
    return this.num
  }

  getGameName() {
    return `game${this.num}`
  }

  setNumberPlus(){
    this.num++
  }
}

const gameStore = new DataStore(io)

class Player {
  constructor(socket){
    this.id = socket.id
    this.socket = socket
  }

  getSocketId() {
    return this.socket.id
  }
}

class Game {
  constructor(player1 = null, player2 = null, name){
    this.name = name
    this.player1 = player1
    this.player2 = player2
    this.status = (player1 && player2) ? "Playing" : "Waiting..."
  }

  getStatus() {
    return this.status
  }

  getName() {
    return this.name
  }

  isPlaying() {
    return !(this.player1 && this.player2)
  }

  isWaiting() {
    if(this.player1 && !this.player2) {
      return true
    } 
  }

  updateStatus() {
    const { player1, player2 } = this
    this.status = (player1 && player2) ? "Playing" : "Waiting..."
  }

  addPlayerTwo(player) {
    this.player2 = player 
    this.status = "Playing"
  }
}

const createNewGame = async (socket, store) => {
  await socket.join(store.getGameName())
  const newPlayer = new Player(socket)
  const currentGame = new Game(newPlayer, null, store.getGameName())

  store.games.push(currentGame)
}

const addPlayerTwoToGame =  async(socket, current, store) => {
  await socket.join(current.getName())
  const newPlayer = new Player(socket)
  current.addPlayerTwo(newPlayer)
  console.log(store.games)
}

const findLastWaiting = (games) => {
  const waiting = games.filter(game => game.isWaiting())
  if(waiting.length === 0) {
    return false
  } else {
    return waiting.pop()
  }
}

const join = async socket => {
  console.log("joining")
  try {
    
    const { games } = gameStore
    const isEmpty = !(io.sockets.adapter.rooms[gameStore.getGameName()])
  
    if(isEmpty) {
      await createNewGame(socket, gameStore)
    } else {
      if(io.sockets.adapter.rooms[gameStore.getGameName()].length === 1) {
        const waiting = findLastWaiting(games);
        if(waiting){
          await addPlayerTwoToGame(socket, waiting, gameStore)
        }
      } else {
        console.log("game room is full")
      }
    } 
    await socket.emit('join', 'test')
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

const message = async data => {
  console.log(data)
}

const playPresses = async (data, socket) => {
  //  find out how to isolate room
  await socket.broadcast.emit("otherPresses", data)
}

const disconnect = async (socket, store) => {
  try {
    await store.removePlayerWith(socket.id)
    await store.removeEmptyGames()
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

app.use(express.static(path.resolve(__dirname, './socket-io-client/build')));
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, './socket-io-client/build', 'index.html'));
});

io.on("connection", socket => {
  let store = new DataStore(io)
  console.log("New client connected");

  join(socket);

  socket.on("message", message); 
  socket.on("presses", (data) => playPresses(data, socket)); 
  socket.on("disconnect", () => disconnect(socket, gameStore));
});

server.listen(port, () => console.log(`Listening on port ${port}`));