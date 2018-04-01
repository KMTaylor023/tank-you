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

const updatePlayer = (player) => {
  if(!players[player.hash]){
    players[player.hash] = player;
    return;
  }
  
  if(player.hash === player_hash) return;
  
  if(players[player.hash].lastUpdate >= player.lastUpdate) return;
  
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
  play.alpha = 0.05;
  
};

const updateBullet = (bullet) => {
  if(!bullets[bullet.hash]){
    bullets[bullet.hash] = bullet;
    return;
  }
  
  if(bullets[bullet.hash].lastUpdate >= bullet.lastUpdate) return;
  
  const bull = bullets[player.hash];
  
  bull.prevX = bullet.prevX;
  bull.prevY = bullet.prevY;
  bull.destX = bullet.destX;
  bull.destY = bullet.destY;
  bull.angle = bullet.angle;
};

const removeUser = (hash) => {
  if(players[hash]) delete players[hash];
};

const killPLayer = (data) => {
  players[data.hash].alive = false;
}

const updatePosition = () => {
  const player = players[hash];

  
  player.prevX = player.x;
  player.prevY = player.y;

  
  if(player.moveUp && player.destY > 0) {
    player.destY -= 2;
  }
  
  if(player.moveDown && player.destY < CANVAS_HEIGHT - player.radius) {
    player.destY += 2;
  }
  
  if(player.moveLeft && player.destX > 0) {
    player.destX -= 2;
  }
  
  if(player.moveRight && player.destX < CANVAS_WIDTH - player.radius) {
    player.destX += 2;
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
    socket.emit('hostMove', player);
  } else {
    
    socket.emit('move', player);
  }
};