var isHost = false;

const setHostListen = (hosting, sock) => {
  const socket = sock;
  if (hosting) {
    socket.on('move', (data) => {
      //TODO
    });
    
    socket.on('shoot', (data) => {
      if(!data || !data.hash) return;
      
      if(!players[data.hash] || players[data.hash].shot) return;
      
      addBullet(data);
      
    });
  } else {
    socket.off('move');
    socket.off('shoot');
  }
}

const addBullet = (bull) => {
  const bullet = bull;
  bullet.radius = 10;
  bullets[bullet.hash] = bullet;
  socket.emit('hostShot',bullet);
}

const removeBullet = (bullet) => {
  delete[bullet.hash];
  socket.emit('removeBullet', bullet);
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