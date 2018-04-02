const directions = {
  DOWNLEFT: 0,
  DOWN: 1,
  DOWNRIGHT: 2, 
  LEFT: 3,
  UPLEFT: 4,
  RIGHT: 5, 
  UPRIGHT: 6,
  UP: 7
};

const PLAYER_SPEED = 2;
const BULLET_SPEED = 4;

const updatePlayer_update = (player) => {
  if(!players[player.hash]){
    players[player.hash] = player;
    return;
  }
  
  if(player.hash === player_hash) return;
  
  if(players[player.hash].lastUpdate >= player.lastUpdate && !isHost) return;
  const play = players[player.hash];
  
  play.prevX = player.prevX;
  play.prevY = player.prevY;
  play.destX = player.destX;
  play.destY = player.destY;
  play.gunAngle = player.gunAngle;
  play.direction = player.direction;
  play.moveLeft = player.moveLeft;
  play.moveRight = player.moveRight;
  play.moveDown = player.moveDown;
  play.moveUp = player.moveUp;
  play.lastUpdate = player.lastUpdate;
  play.alpha = 0.05;
  
};

const updateBullets_update = (data) => {
  
  const keys = Object.keys(data);
  
  for(let i = 0; i < keys.length; i++){
    const bullet = data[keys[i]];
    
    if(!bullets[bullet.hash]){
      bullets[bullet.hash] = bullet;
      players[bullet.hash].shot = true;
      continue;
    }
    
    if(bullets[bullet.hash].lastUpdate >= bullet.lastUpdate) return;
    
    const bull = bullets[bullet.hash];
    
    bull.prevX = bullet.prevX;
    bull.prevY = bullet.prevY;
    bull.destX = bullet.destX;
    bull.destY = bullet.destY;
    bull.lastUpdate = bullet.lastUpdate;
    bull.xpercent = bullet.xpercent;
    bull.ypercent = bullet.ypercent;
    bull.alpha = 0.05;
  }
};

const addPlayers_update = (data) => {
  if(gameState === LOADING_STATE){
    updateGameState(WAITING_STATE);
  }
  const keys = Object.keys(data);
  
  for(let i = 0; i < keys.length; i++){
    players[keys[i]] = data[keys[i]];
  }
};

const checkGameOver_update = () => {
  let hash = 0;
  let count = 0;
  
  const keys = Object.keys(players);
  
  for(let i = 0 ; i < keys.length; i++){
    if(players[keys[i]].alive){
      count++;
      hash = keys[i];
    }
  }
  if(count === 1){
    gameOver(hash);
  }
}

const removeUser = (hash) => {
  if(players[hash]) delete players[hash];
  if(gameState === WAITING_STATE) removePlayerFromHost(hash);
};

const killPlayer = (data) => {
  players[data.hash].alive = false;
};


const deleteGame = () => {
  const keys = Object.keys(players);
  
  
  for(let i = 0; i < keys.lengh; i++){
    delete players[keys[i]];
  };
  
  const bkeys = Object.keys(bullets);
  
  for(let i = 0; i < bkeys.length; i++){
    delete bullets[bkeys[i]];
  }
};

const removeBullet = (bullet) => {
  delete bullets[bullet.hash];
  players[bullet.hash].shot = false;
}

const resetGame = (data) => {
  deleteGame();
  
  const nkeys = Object.keys(data);
  
  for(let i = 0; i < nkeys.length; i++){
    players[nkeys[i]] = data[nkeys[i]];
  };
  
  resetGameState();
};

const updatePosition = () => {
  const player = players[player_hash];

  
  player.prevX = player.x;
  player.prevY = player.y;

  
  if(player.moveUp && player.destY > player.radius) {
    player.destY -= PLAYER_SPEED;
  }
  
  if(player.moveDown && player.destY < CANVAS_HEIGHT - player.radius) {
    player.destY += PLAYER_SPEED;
  }
  
  if(player.moveLeft && player.destX > player.radius) {
    player.destX -= PLAYER_SPEED;
  }
  
  if(player.moveRight && player.destX < CANVAS_WIDTH - player.radius) {
    player.destX += PLAYER_SPEED;
  }

  
  if(player.moveUp && player.moveLeft) player.direction = directions.UPLEFT;
  else if(player.moveUp && player.moveRight) player.direction = directions.UPRIGHT;
  else if(player.moveDown && player.moveLeft) player.direction = directions.DOWNLEFT;
  else if(player.moveDown && player.moveRight) player.direction = directions.DOWNRIGHT;
  else if(player.moveDown && !(player.moveRight || player.moveLeft)) player.direction = directions.DOWN;
  else if(player.moveUp && !(player.moveRight || player.moveLeft)) player.direction = directions.UP;
  else if(player.moveLeft && !(player.moveUp || player.moveDown)) player.direction = directions.LEFT;
  else if(player.moveRight && !(player.moveUp || player.moveDown)) player.direction = directions.RIGHT;

  
  player.alpha = 0.05;

  
  if(isHost) {
    player.lastUpdate = new Date().getTime();
    doMovement(player);
  } else {
    clientMove(player);
  }
};



const updateBulletPositions = () => {
  if(!isHost) return;
  
  const keys = Object.keys(bullets);
  
  for(let i = 0; i < keys.length; i++) {
    const bullet = bullets[keys[i]];
    const xp = bullet.xpercent;
    const yp = bullet.ypercent;
    
    bullet.prevX = bullet.x;
    bullet.prevY = bullet.y;
    
    bullet.destX += (xp * BULLET_SPEED);
    bullet.destY += (yp * BULLET_SPEED);
    bullet.lastUpdate = new Date().getTime();
  }
  sendBulletUpdates();
  checkBullets_collision();
}