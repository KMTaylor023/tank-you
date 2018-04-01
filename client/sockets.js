/*
+++++++++++++++++++++++++++++++++++++++++ Client Socket emission
*/

const joinRoom = (room) => {
  if(!room) return;
  
  updateGameState(LOADING_STATE);
  
  socket.emit('join', room);
}

const sendShot = (bullet) => {
  if (players[player_hash].shot) return;
  
  if(isHost) {
    addBullet(bullet);
  } else {
    socket.emit('shoot', {player: players[player_hash], bullet});
  }
};

/*
----------------------------------------- Client Socket emission
*/

/*
+++++++++++++++++++++++++++++++++++++++++ Client Socket reception
*/
const onMove = (sock) => {
  const socket = sock;
  
  socket.on('updatedMovement', (data) => {
    
  });
};

const onShot = (sock) => {
  const socket = sock;
  
  socket.on('updateShot' = (data) => {
    if(data.hash === player_hash){
      players[player_hash].shot = true;
    }
    updateBullet(data);
  })
};

onShotRemoved = (sock) => {
  const socket = sock;
  
  socket.on('shotRemoved', (data) => {
    if(data.hash === player_hash){
      players[player_hash].shot = false;
    }
    removeBullet(data);
  })
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
    addPlayers(data);
  });
};

const onReset = (sock) => {
  const socket = sock;
  
  socket.on('resetGame', () => {
    resetGame();
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
    manageLobby(data, sock);
  });
};


const onErr = (sock) => {
  const socket = sock;
  
  socket.on('err', (data) => {
    deleteGame();
    enterLobby();
    if(data && data.msg) showErr(data.msg);
  })
}

/*
----------------------------------------- Client Socket reception
*/
