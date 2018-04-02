var animationID = 0;

var canvas;
var ctx;

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

//starts off the canvas
const initializeCanvas = () => {
  canvas = document.querySelector('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvas.style.border = '1px solid blue';
  
  ctx = canvas.getContext('2d');
}

//lerps from v0 to v1 by alpha
const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

//starts drawing
const startDraw = () => {
  animationID = requestAnimationFrame(redraw);
}

//stops drawing
const stopDraw = () => {
  if(animationID === 0) return;
  cancelAnimationFrame(animationID);
}

//does all drawing of canvas
const redraw = (time) => {
  if(gameState === RUNNING_STATE) {
    updatePosition();
    if(isHost) updateBulletPositions();
  }

  ctx.clearRect(0, 0, 500, 500);

  
  const bkeys = Object.keys(bullets);

  //draw bullets first so they are under the firing player
  if(gameState === RUNNING_STATE) {
    for(let i = 0; i < bkeys.length; i++) {
      const bullet = bullets[bkeys[i]];
     
      bullet.x = lerp(bullet.prevX, bullet.destX, bullet.alpha);
      bullet.y = lerp(bullet.prevY, bullet.destY, bullet.alpha);
      
      //TODO drawing the BULLET
      /*
      ctx.drawImage(
        slashImage,
        bullet.x,
        bullet.y,
        bullet.width,
        bullet.height
      );*/
      
      if(bullet.hash === player_hash) {
        ctx.fillStyle = 'blue';
      }
      else {
        ctx.fillStyle = 'red'
      }
      
      ctx.beginPath();
      ctx.arc(bullet.x,bullet.y,bullet.radius,0,2*Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  
  const keys = Object.keys(players);
  
  for(let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];
    
    if(!player.alive) continue;/////////Don't Draw this guy
    
    
    if (gameState === RUNNING_STATE) {
      if(player.alpha < 1) player.alpha += 0.05;
  
      player.x = lerp(player.prevX, player.destX, player.alpha);
      player.y = lerp(player.prevY, player.destY, player.alpha);      
    }

    //TODO DRAWING THE PLAYER
    /*
    ctx.drawImage(
      walkImage, 
      spriteSizes.WIDTH * player.frame,
      spriteSizes.HEIGHT * player.direction,
      spriteSizes.WIDTH, 
      spriteSizes.HEIGHT,
      player.x, 
      player.y, 
      spriteSizes.WIDTH, 
      spriteSizes.HEIGHT
    );
    
    
    ctx.strokeRect(player.x, player.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);
    */
    
    if(player.hash === player_hash) {
      ctx.fillStyle = 'blue';
    }
    else {
      ctx.fillStyle = 'red';
    }
    
    ctx.beginPath();
    ctx.arc(player.x,player.y,player.radius,0,2*Math.PI);
    ctx.closePath();
    ctx.fill();
  }
    
  

  //set our next animation frame
  animationID = requestAnimationFrame(redraw);
};