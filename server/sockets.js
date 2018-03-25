const xxh = require('xxhashjs');
const Tank = require('./Tank.js');

let io;


const confirmHost = (sock) => {
  const socket = sock;
  
  socket.host = true;
  
  socket.hostSocket = socket;
  
  socket.on('hostMove', (data) => {
    
    socket.broadcast.to('room1').emit('updatedMovement', data);
  });
  
  socket.emit('hosting');
};

const configureSocket = (sock) => {
  const socket = sock;

  
  const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
  
  socket.hash = hash;
  
  const character = new Character(hash);

  
  const socketRoom = io.sockets.adapter.rooms.room1;
  
  
  if (!socketRoom || socketRoom.length === 0) {
    
    confirmHost(socket);
  } else {
    
    socket.isHost = false;
    
    const socketKeys = Object.keys(socketRoom.sockets);
    
    let hostFound = false; 

    for (let i = 0; i < socketKeys.length; i++) {
      const socketUser = io.sockets.connected[socketKeys[i]];

      if (socketUser.isHost) {
        socket.hostSocket = socketUser;
        socket.hostSocket.emit('hostAcknowledge', character);
        hostFound = true;
        break;
      }
    }

    if (!hostFound) {
      confirmHost(socket);
    }
  }

  socket.join('room1');
  socket.emit('joined', character);
};


const setup = (server) => {
  io = server;
  
  socket.on('')
}

module.exports.setup = setup;