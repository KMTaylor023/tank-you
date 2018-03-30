const xxh = require('xxhashjs');

const Tank = require('./Tank.js');
const hostRelay = require('./hostRelay.js');
var io;

const MAX_ROOM_SIZE = 4;

const rooms = {};
const players = {};


/*
+++++++++++++++++++++++++++++++++++++++++ Socket message helper functions
*/

const doHash = (data) => {
  return xxh.h32(`${data}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
};

const socketErr = (socket, msg) => {
  socket.emit('err', { msg });
};

const defaultSocket = (sock) => {
  const socket = sock;
  
  socket.host = false;
  socket.hostSocket = undefined;
}

const enterLobby = (sock) => {
  const socket = sock;

  socket.emit('lobby', rooms);

  socket.join('lobby');
};

const updateLobby = (room) => {
  io.to('lobby').emit('updateLobby', { room });
  if (room.players.length === 0) {
    delete rooms[room];
  }
};

const joinRoom = (sock, roomName) => {
  const socket = sock;

  //already in a room, couldn't have gotten here the correct way
  if (socket.roomString) {
    return;
  }

  if (!rooms[roomName]) {
    return socketErr(socket, 'Room not found');
  }

  if (rooms[roomName].running || rooms[roomName].over) {
    return socketErr(socket, 'Game in progress');
  }
  
  if (rooms[roomName].players.length >= MAX_ROOM_SIZE){
    return socketErr(socket, 'Room is full');
  }
  
  const room = rooms[roomName];
  
  socket.join(roomName);
  socket.roomString = roomName;
  
  if (room.players.length === 0){
    hostRelay.confirmHost(socket, room);
  }
  else{
    socket.hostSocket = room.hostSocket;
    room.hostSocket.emit('playerJoined', socket.hash);
  }
  
  
  room.players.push(socket.hash);
  updateLobby(roomName);
};


const leaveRoom = (sock) => {
  const socket = sock;

  if (!socket.roomString) {
    return;
  }

  const s = socket.roomString;
  
  if(rooms[s]){
    const room = rooms[s];
  
    room.players.splice(room.players.indexOf(socket.hash));
  
    socket.broadcast.to(socket.roomString).emit('left', { hash: socket.hash });
  
    //TODO swap to a new host?
    if(room.players.length !== 0 && socket.host){
      socket.broadcast.to(socket.roomString).emit('host_left',{});
      room.players = [];
    }
    updateLobby(s);
  }

  socket.leave(socket.roomString);
  delete socket.roomString;
};

/*
----------------------------------------- Socket message helper functions
*/


/*
+++++++++++++++++++++++++++++++++++++++++ On event Functions
*/

// creates a room for a socket
const onCreate = (sock) => {
  const socket = sock;

  socket.on('createRoom', (data) => {
    const room = data.room
    if (!room || socket.roomString) {
      return;// no error message, had to cheat to get here
    }

    if (rooms[room] || room === 'lobby') {
      socketErr(socket, 'Room name already exists');
      return;
    }

    rooms[room] = { players: [], running: false, over: false };

    joinRoom(socket, room);
  });
};

//sets up all messages to host sockets
const onMessageToHost = (sock) => {
  
  //validates that the socket with data should be relayed to host
  const validSocketToRelay = (socket, data) => {
    if(!socket.roomString || socket.host) return false;
    if(!data || !data.hash || data.hash !== socket.hash) return false;
    return true;
  };
  
  //list of all messages that may relay
  const messagesToHost = ['shoot','move'];
  
  //set each message to relay to host if valid
  for(let i = 0; i < messagesToHost.length; i++){
    const m = messagesToHost[i];
    socket.on(m, (data) => {
      if(!validSocketToRelay(socket, data)) return;
      
      socket.hostSocket.emit(m, data);
    });
  }
}

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    leaveRoom(socket);
    socket.leave('lobby');
    socket.removeAllListeners();
    delete socket.roomString;
  });
};

const onJoinRoom = (sock) => {
  const socket = sock;
  
  socket.on('join', (data) => {
    if (!data || !data.room) {
      return socketErr(socket, 'No room name given');
    }
    
    return joinRoom(socket, data.room);
  });
};

const onLeave = (sock) => {
  const socket = sock;

  socket.on('leave', () => {
    if (!socket.roomString) {
      return;
    }

    leaveRoom(socket);
  });
};

/*
----------------------------------------- On event Functions
*/


const setup = (server) => {
  io = server;
  
  io.on('connection', (sock) => {
    const socket = sock;
    
    const hash = doHash(socket.id);
    socket.hash = hash;
    
    players[socket.hash] = socket;
    
    defaultSocket(socket);
    
    enterLobby(socket);
    
    
    
    onMessageToHost(socket);
    onJoinRoom(socket);
    onLeaveRoom(socket);
    onDisconnect(socket);
  });
}

module.exports.setup = setup;