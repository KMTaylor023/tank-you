/*
+++++++++++++++++++++++++++++++++++++++++ Client Socket emission
*/
//trys to join a room
const joinRoom = (room) => {
  if(!room) return;
  
  updateGameState(LOADING_STATE);
  
  document.querySelector('#host_controls').style.display = 'none';
  socket.emit('join', {room});
};

//leaves a room
const leaveRoom = () => {
  socket.emit('leave', {});
}

//creates a room
const createRoom = (room) => {
  socket.emit('createRoom',{room});
  updateGameState(LOADING_STATE);
}

//sends a shot
const sendShot = (bullet) => {
  if (players[player_hash].shot) return;
  
  if(isHost) {
    addBullet(bullet);
  } else {
    socket.emit('shoot', bullet);
  }
};

//moves the player
const clientMove = (player) => {
  socket.emit('move', player);
}

/*
----------------------------------------- Client Socket emission
*/

/*
+++++++++++++++++++++++++++++++++++++++++ Client Socket reception
*/
//movement happened ooo
const onMove = (sock) => {
  const socket = sock;
  
  socket.on('updatedMovement', (data) => {
    updatePlayer_update(data);
  });
};

//a bullet has been removed
const onRemoveBullet = (sock) => {
  const socket = sock;
  
  socket.on('removeBullet', (data) => {
    if(data.hash === player_hash){
      players[player_hash].shot = false;
    }
    removeBullet(data);
  });
}

//a player has been hit
const onHit = (sock) => {
  const socket = sock;
  
  socket.on('hit', (data) => {
    killPlayer(data);
  });
};

//player joined
const onPlayerJoined = (sock) => {
  const socket = sock;
  
  socket.on('playerJoined', (data) => {
    addPlayers_update(data);
  });
};


//updated bullets received
const onUpdateBullets = (sock) => {
  const socket = sock;
  
  socket.on('updateBullets', (data) => {
    updateBullets_update(data);
  });
};

//game ended
const onGameOver = (sock) => {
  const socket = sock;
  
  socket.on('gameOver', (data) => {
    if(!data || !data.winner){
      return;
    }
    endGame(data.winner);
  });
};

//do lobby update
const onLobby = (sock) => {
  const socket = sock;
  
  socket.on('updateLobby', (data) => {
    manageLobby(data);
  });
};

//a player left
const onLeft = (sock) => {
  const socket = sock;
  
  socket.on('left', (data) => {
    removeUser(data.hash);
  });
}

//become or stop being the host
const onHost = (sock) => {
  const socket = sock;
  
  socket.on('hostOn', (data) => {
    setHostListen(true,data);
  });
  
  socket.on('hostOff', () => {
    setHostListen(false);
  });
};

//error received
const onErr = (sock) => {
  const socket = sock;
  
  socket.on('err', (data) => {
    exitGame();
    if(data && data.msg) alert(data.msg);
  });
};

//retrieves the players hash
const onGetHash = (sock) => {
  const socket = sock;
  
  socket.on('getHash', (data) => {
    player_hash = data.hash;
  });
};
//game started
const onStartGame = (sock) => {
  const socket = sock;
  
  socket.on('startGame', () => {
    startGame();
  });
}

//when the host leaves the game
const onHostLeft = (sock) => {
  const socket = sock;
  
  socket.on('hostLeft', () => {
    exitGame();
    alert('host left');
  });
};

/*
----------------------------------------- Client Socket reception
*/
//sets up socket
const setupSocket = () => {
  socket.on('connect', () => {
    onHostLeft(socket);
    onGetHash(socket);
    onLeft(socket);
    onStartGame(socket);
    onMove(socket);
    onRemoveBullet(socket);
    onHit(socket);
    onPlayerJoined(socket);
    onGameOver(socket);
    onLobby(socket);
    onErr(socket);
    onHost(socket);
  });
}

