const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

const redraw = (time) => {
  updatePosition();

  ctx.clearRect(0, 0, 500, 500);

  
  const keys = Object.keys(players);

  //draw bullets first so they are under the firing player
  for(let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    
    if(bullet.hash === hash) {
      ctx.fillStyle = 'blue';
    }
    else {
      ctx.fillStyle = 'red'
    }
    
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
    
    ctx.arc(bullet.x,bullet.y,bullet.radius,0,2*Math.PI);
    ctx.fill();
  }
  
  for(let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];
    
    if(!player.alive) continue;/////////Don't Draw this guy
    
    if(player.alpha < 1) player.alpha += 0.05;
    
    if(player.hash === hash) {
      ctx.fillStyle = 'blue'
    }
    else {
      ctx.fillStyle = 'red'
    }

    
    player.x = lerp(player.prevX, player.destX, player.alpha);
    player.y = lerp(player.prevY, player.destY, player.alpha);

    
    if(player.frame > 0 || (player.moveUp || player.moveDown || player.moveRight || player.moveLeft)) {
      player.frameCount++; 

      
      
      if(player.frameCount % 8 === 0) {
        if(player.frame < 7) {
          player.frame++;
        } else {
          player.frame = 0;
        }
      }
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
    
    ctx.arc(player.x,player.y,player.radius,0,2*Math.PI);
    ctx.fill();
  }
    
  

  //set our next animation frame
  animationFrame = requestAnimationFrame(redraw);
};