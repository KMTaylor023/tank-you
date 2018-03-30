/*
+++++++++++++++++++++++++++++++++++++++++ Socket emission
*/

const joinRoom = (room) => {
  if(!room) return;
  
  updateGameState(LOADING_STATE);
  
  socket.emit('join', room);
}

/*
----------------------------------------- Socket emission
*/

/*
+++++++++++++++++++++++++++++++++++++++++ Socket reception
*/
const onMove = (sock) => {
  const socket = sock;
  
  socket.on('updatedMovement', (data) => {
    
  });
};

const onHit = (sock) => {
  const socket = sock;
  
  socket.on('hit', (data) => {
    
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

/*
----------------------------------------- Socket reception
*/
