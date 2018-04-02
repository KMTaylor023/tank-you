/*
+++++++++++++++++++++++++++++++++++++++++ Client Socket emission
*/

const joinRoom = (room) => {
  if(!room) return;
  
  updateGameState(LOADING_STATE);
  
  document.querySelector('#host_controls').style.display = 'none';
  socket.emit('join', {room});
};

const leaveRoom = () => {
  socket.emit('leave', {});
}

const createRoom = (room) => {
  socket.emit('createRoom',{room});
  updateGameState(LOADING_STATE);
}

const sendShot = (bullet) => {
  if (players[player_hash].shot) return;
  
  if(isHost) {
    addBullet(bullet);
  } else {
    socket.emit('shoot', bullet);
  }
};

const clientMove = (player) => {
  socket.emit('move', player);
}

/*
----------------------------------------- Client Socket emission
*/

/*
+++++++++++++++++++++++++++++++++++++++++ Client Socket reception
*/
const onMove = (sock) => {
  const socket = sock;
  
  socket.on('updatedMovement', (data) => {
    updatePlayer_update(data);
  });
};

const onShot = (sock) => {
  const socket = sock;
  
  socket.on('updateBullets', (data) => {
    updateBullets_update(data);
  });
};

const onRemoveBullet = (sock) => {
  const socket = sock;
  
  socket.on('removeBullet', (data) => {
    if(data.hash === player_hash){
      players[player_hash].shot = false;
    }
    removeBullet(data);
  });
}

const onHit = (sock) => {
  const socket = sock;
  
  socket.on('hit', (data) => {
    killPlayer(data);
  });
};

const onPlayerJoined = (sock) => {
  const socket = sock;
  
  socket.on('playerJoined', (data) => {
    addPlayers_update(data);
  });
};

const onUpdateBullets = (sock) => {
  const socket = sock;
  
  socket.on('updateBullets', (data) => {
    updateBullets_update(data);
  });
}

const onReset = (sock) => {
  const socket = sock;
  
  socket.on('resetGame', (data) => {
    resetGame(data);
  });
};

const onGameOver = (sock) => {
  const socket = sock;
  
  socket.on('gameOver', (data) => {
    if(!data || !data.winner){
      return;
    }
    endGame(data.winner);
  });
};


const onLobby = (sock) => {
  const socket = sock;
  
  socket.on('updateLobby', (data) => {
    manageLobby(data);
  });
};

const onLeft = (sock) => {
  const socket = sock;
  
  socket.on('left', (data) => {
    removeUser(data.hash);
  });
}

const onHost = (sock) => {
  const socket = sock;
  
  socket.on('hostOn', (data) => {
    setHostListen(true,data);
  });
  
  socket.on('hostOff', () => {
    setHostListen(false);
  });
};

const onErr = (sock) => {
  const socket = sock;
  
  socket.on('err', (data) => {
    exitGame();
    if(data && data.msg) showError(data.msg);
  });
};

const onGetHash = (sock) => {
  const socket = sock;
  
  socket.on('getHash', (data) => {
    player_hash = data.hash;
  });
};

const onStartGame = (sock) => {
  const socket = sock;
  
  socket.on('startGame', () => {
    startGame();
  });
}

const onHostLeft = (sock) => {
  const socket = sock;
  
  socket.on('hostLeft', () => {
    exitGame();
    showError('host left');
  });
};

/*
----------------------------------------- Client Socket reception
*/

const setupSocket = () => {
  socket.on('connect', () => {
    onHostLeft(socket);
    onGetHash(socket);
    onLeft(socket);
    onStartGame(socket);
    onMove(socket);
    onShot(socket);
    onRemoveBullet(socket);
    onReset(socket);
    onHit(socket);
    onPlayerJoined(socket);
    onGameOver(socket);
    onLobby(socket);
    onErr(socket);
    onHost(socket);
  });
}

