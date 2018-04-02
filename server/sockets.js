const xxh = require('xxhashjs');

const Tank = require('./Tank.js');
const hostRelay = require('./hostRelay.js');

let io;

const MAX_ROOM_SIZE = 4;

const rooms = {};
const players = {};


/*
+++++++++++++++++++++++++++++++++++++++++ Socket message helper functions
*/

const doHash = data => xxh.h32(`${data}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

const socketErr = (socket, msg) => {
  socket.emit('err', { msg });
};

const defaultSocket = (sock) => {
  const socket = sock;

  socket.host = false;
  socket.hostSocket = undefined;
};

const enterLobby = (sock) => {
  const socket = sock;

  socket.emit('updateLobby', rooms);

  socket.join('lobby');
};

const updateLobby = (room) => {
  let rdata = {};
  rdata[room.roomName] = room;
  io.to('lobby').emit('updateLobby', rdata);
  
  if (room.players.length === 0) {
    delete rooms[room.roomName];
  }
};

const joinRoom = (sock, roomName) => {
  const socket = sock;

  // already in a room, couldn't have gotten here the correct way
  if (socket.roomString) {
    return socketErr(socket, 'Already in room');
  }

  if (!rooms[roomName]) {
    return socketErr(socket, 'Room not found');
  }

  if (rooms[roomName].running || rooms[roomName].over) {
    return socketErr(socket, 'Game in progress');
  }

  if (rooms[roomName].full) {
    return socketErr(socket, 'Room is full');
  }

  const room = rooms[roomName];
  

  socket.join(roomName);
  socket.roomString = roomName;

  const tank = new Tank(socket.hash);

  if (room.players.length === 0) {
    hostRelay.confirmHost(socket, room, tank, updateLobby);
  } else {
    socket.hostSocket = players[room.hostSocket];
    socket.hostSocket.emit('addPlayer', tank);
  }


  room.players.push(socket.hash);

  if (room.players.length === MAX_ROOM_SIZE) {
    room.full = true;
  }

  return updateLobby(room);
};


const leaveRoom = (sock) => {
  const socket = sock;
  if (!socket.roomString) {
    return;
  }

  const s = socket.roomString;
  if (rooms[s]) {
    const room = rooms[s];
    room.players.splice(room.players.indexOf(socket.hash));
    room.full = false;

    socket.broadcast.to(socket.roomString).emit('left', { hash: socket.hash });
    if (socket.host) {
      socket.broadcast.to(socket.roomString).emit('hostLeft', {});
      room.players = [];
    }
    
    updateLobby(room);
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
const onCreateRoom = (sock) => {
  const socket = sock;

  socket.on('createRoom', (data) => {
    const { room } = data;
    if (!room || socket.roomString) {
      return;// no error message, had to cheat to get here
    }

    if (rooms[room] || room === 'lobby') {
      socketErr(socket, 'Room name already exists');
      return;
    }

    rooms[room] = {
      players: [], running: false, over: false, full: false, roomName: room,
    };

    joinRoom(socket, room);
  });
};

// sets up all messages to host sockets
const onMessageToHost = (socket) => {
  // validates that the socket with data should be relayed to host
  const validSocketToRelay = (data) => {
    if (!socket.roomString || socket.host) return false;
    if (!data || !data.hash || data.hash !== socket.hash) return false;
    return true;
  };

  const relayMessage = (msg) => {
    socket.on(msg, (data) => {
      if (!validSocketToRelay(data)) return;

      socket.hostSocket.emit(msg, data);
    });
  };

  // list of all messages that may relay
  const messagesToHost = ['shoot', 'move'];

  // set each message to relay to host if valid
  for (let i = 0; i < messagesToHost.length; i++) {
    relayMessage(messagesToHost[i]);
  }
};

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

const onLeaveRoom = (sock) => {
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
    socket.emit('getHash', {hash});

    players[socket.hash] = socket;

    defaultSocket(socket);

    enterLobby(socket);


    onMessageToHost(socket);
    onCreateRoom(socket);
    onJoinRoom(socket);
    onLeaveRoom(socket);
    onDisconnect(socket);
  });
};

module.exports.setup = setup;
