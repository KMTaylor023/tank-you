var isHost = false;

const playerOrder = [];

//setes up the host controls
const initializeHostControls = () => {
  document.querySelector('#host_start').addEventListener('click', (e) => {
    e.preventDefault();
    if(!isHost || gameState !== WAITING_STATE){
      return false;
    }
    
    socket.emit('gameStart', {});
    startGame();
  });
}

//sets up the given tank in a position o nthe screen
const setupTank = (data) => {
  const tank = data;
  const num = playerOrder.length;
  const r = tank.radius;
  
  players[data.hash] = tank; 
  
  playerOrder.push(tank.hash);
  switch(num) {
    case 0:
      tank.x = r;
      tank.y = r;
      break;
    case 1:
      tank.x = CANVAS_WIDTH - r;
      tank.y = r;
      break;
    case 2: 
      tank.x = CANVAS_WIDTH - r;
      tank.y = CANVAS_HEIGHT - r;
      break;
    default:
      tank.x = r;
      tank.y = CANVAS_HEIGHT - r;
      break;
  }
  
  tank.prevX = tank.x;
  tank.prevY = tank.y;
  tank.destX = tank.x;
  tank.destY = tank.y;
  
  return tank;
};

//removes the player from the hosts special list
const removePlayerFromHost = (hash) => {
  if(!isHost) return;
  
  playerOrder.splice(0,playerOrder.length);
  
  const keys = Object.keys(players);
  for(let i = 0; i< keys.length; i++){
    let tank = players[keys[i]];
    tank = setupTank(tank);
  }
  socket.emit('playerJoined', players);
}

//sets the socket to listen for host specific messages
const setHostListen = (hosting, tank) => {
  isHost = hosting;
  setViewHostControl(hosting);
  if (hosting) {
    player_hash = tank.hash;
    
    setupTank(tank);
    
    socket.on('move', (data) => {
      updatePlayer_update(data);
      players[data.hash].lastUpdate = new Date().getTime();
      socket.emit('hostMove', players[data.hash]);
    });
    
    socket.on('shoot', (data) => {
      if(!data || !data.hash) return;
      
      if(!players[data.hash] || players[data.hash].shot) return;
      
      if(gameState !== RUNNING_STATE) return;
      addBullet(data);
      sendBulletUpdates();
    });
    
    socket.on('addPlayer', (data) => {
      doPlayerJoin(data);
    });
    
    updateGameState(WAITING_STATE);
  } else {
    socket.off('move');
    socket.off('shoot');
    socket.off('addPlayer');
  }
};

//ends game with hash as winner
const gameOver = (hash) => {
  socket.emit('gameOver', {winner: hash});
  console.log(hash);
  endGame(hash);
}

//sends all the bullets
const sendBulletUpdates = () => {
  socket.emit('hostShots', bullets);
}

//adds a bullet
const addBullet = (bull) => {
  const bullet = bull;
  bullet.radius = 10;
  bullets[bullet.hash] = bullet;
  players[bullet.hash].shot = true;
};

//removes a bullet
const hostRemoveBullet = (bullet) => {
  removeBullet(bullet);
  socket.emit('removeBullet', bullet);
};

//updates movement with data
const doMovement = (data) => {
  if(!isHost) return;
  socket.emit('hostMove',data);
};

//does a hit
const doHit = (data) => {
  if(!isHost) return;
  socket.emit('hostHit', data);
};

//adds a player to the game
const doPlayerJoin = (data) => {
  if(!isHost) return;
  const tank = setupTank(data);
  socket.emit('playerJoined', players);
};