const confirmHost = (sock, rm, update) => {
  const room = rm;
  const socket = sock;

  socket.host = true;
  socket.hostSocket = socket;
  room.hostSocket = socket;

  //TODO add last update to all?????//////////////////////////////////////////////
  socket.on('hostMove', (data) => {
    socket.broadcast.to(socket.roomString).emit('updatedMovement', data);
  });

  socket.on('hostHit', (data) => {
    socket.broadcast.to(socket.roomString).emit('hit', data);
  });

  // a new player joined. Update everyone on current players
  // include hash of new player
  socket.on('playerJoined', (data) => {
    socket.broadcast.to(socket.roomString).emit('playerJoined', data);
  });

  socket.on('gameStart', () => {
    room.started = true;
    update(room);
    
    socket.broadcast.to(socket.roomString).emit('startGame', {});
  });

  socket.on('gameOver', (data) => {
    if(!data || !data.winner) return;
    
    room.started = false;
    room.over = true;
    
    update(room);
    
    socket.broadcast.to(socket.roomString).emit('gameOver', {winner: data.winner});
  });
  
  socket.on('resetGame', () => {
    if(!room.over) return;
    room.over = false;
    
    update(room);
    
    socket.broadcast.to(socket.roomString).emit('resetGame', {});
  });

  socket.emit('host_on');
};


const removeHost = (sock) => {
  const socket = sock;

  socket.host = false;
  delete socket.hostSocket;

  socket.off('hostMove');
  socket.off('hostHit');
  socket.off('gameStart');
  socket.off('playerJoin');
  socket.off('gameOver');

  socket.emit('host_off');
};

module.exports.confirmHost = confirmHost;
module.exports.removeHost = removeHost;
