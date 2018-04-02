//checks collisions between two spheres
const checkCollisions = (c1, c2) => {
  const dist = Math.pow((c1.x - c2.x),2) + Math.pow((c1.y - c2.y),2);
  if (dist <= Math.pow((c1.radius - c2.radius),2)){
    return true;
  }
  return false;
};

//checks if bullets left game
const bulletOutBounds = (bullet) => {
  if(bullet.x + bullet.radius >= CANVAS_WIDTH ||
     bullet.x - bullet.radius <= 0 ||
     bullet.y + bullet.radius >= CANVAS_HEIGHT ||
     bullet.y - bullet.radius <= 0){
    return true;
  }
  return false;
}

//checks for bullet collisions
const checkBullets_collision = () => {
  let pkeys = Object.keys(players);
  let bkeys = Object.keys(bullets);
  
  for(let b = 0; b < bkeys.length; b++) {
    let destroyBullet = false;
    const bkey = bkeys[b];
    const bullet = bullets[bkey];
    for(let p = 0; p < pkeys.length && !destroyBullet; p++){
      const pkey = pkeys[p];
      const player = players[pkey];
      
      if(player.hash !== bullet.hash && player.alive){
        const hit = checkCollisions(player, bullet);
        
        if(hit){
          doHit(player);
          hostRemoveBullet(bullet);
          destroyBullet = true;
          player.alive = false;
          
          checkGameOver_update();
        }
      }
    }
    
    if(!destroyBullet && bulletOutBounds(bullet)){
      hostRemoveBullet(bullet);
    }
  }
};