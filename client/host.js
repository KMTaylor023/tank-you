var isHost = false;

const setHostListen = (hosting, sock) => {
  const socket = sock;
  if (hosting) {
    socket.on('move', (data) => {
      //TODO
    });
    
    socket.on('shoot', (data) => {
      if(!data || !)
    });
  } else {
    socket.off('move');
    socket.off('shoot');
  }
}

const doMovement = (data) => {
  if(!isHost) return;
  socket.emit('hostMove',data);
};

const doHit = (data) => {
  if(!isHost) return;
  socket.emit('hostHit', data);
};

const doPlayerJoin = (data) => {
  if(!isHost) return;
  socket.emit('playerJoined', data);
};


const onHostOn = (sock) => {
  const socket = sock;
  
  socket.on('host_on', () => {
    isHost = true;
    setHostListen(true,socket);
  });
};

const onHostOff = (sock) => {
  const socket = sock;
  
  socket.on('host_off', () => {
    isHost = false;
    setHostListen(false,socket);
  });
};