class Tank {
  constructor(hash) {
    this.hash = hash;
    this.lastUpdate = new Date().getTime();

    // The tank has a circular hit box
    this.x = 0;
    this.y = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.destX = 0;
    this.destY = 0;
    this.radius = 50;

    // Tank Specific things
    this.alive = true;
    this.gunAngle = 0;
    this.shot = false;

    // animation variables
    this.alpha = 0;
    this.direction = 0;
    this.frame = 0;
    this.frameCount = 0;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveDown = false;
    this.moveUp = false;
  }
}

module.exports = Tank;
