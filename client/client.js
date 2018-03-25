const players = {};
let player_hash = 0;

const gamelist = {};

const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;

// left,  up,    right,  down
const move = [false, false, false, false];


// +++++++ Key handlers deal with setting player direction when game is running
const keyDownHandler = (e) => {
  const keyPressed = e.which;
  if (keyPressed === 87 || keyPressed === 38) {
    move[UP] = true;
  } else if (keyPressed === 65 || keyPressed === 37) {
    move[LEFT] = true;
  } else if (keyPressed === 83 || keyPressed === 40) {
    move[DOWN] = true;
  } else if (keyPressed === 68 || keyPressed === 39) {
    move[RIGHT] = true;
  }
  if (move[UP] || move[LEFT] || move[DOWN] || move[RIGHT]) {
    e.preventDefault(true);
  }
};

const keyUpHandler = (e) => {
  const keyPressed = e.which;
  if (keyPressed === 87 || keyPressed === 38) {
    move[UP] = false;
  } else if (keyPressed === 65 || keyPressed === 37) {
    move[LEFT] = false;
  } else if (keyPressed === 83 || keyPressed === 40) {
    move[DOWN] = false;
  } else if (keyPressed === 68 || keyPressed === 39) {
    move[RIGHT] = false;
  }
};
// -------

// Updates a plyers position
const updatePlayer = (number, data) => {
};


// sets the pplayer number square up
const addPlayer = (number) => {
 
};

// resets the current game state
const resetGame = () => {
  
};


// exists the game, removes all game state vars
const exitGame = () => {
  
};

// Updates position, returns true if player is now in win spot
const updatePosition = (sock) => {

};

// draws a player
const drawPlayer = (hash, ctx, color) => {
};

// redraws the game
const redraw = (time, socket, canvas, ctx) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const playKeys = Object.keys(players);
  for (let i = 0; i < playKeys.length; i++) {
    if (playKeys[i] !== player_hash) {
      drawPlayer(playKeys[i], ctx, 'red');
    }
  }
  // draw us on top
  drawPlayer(player_hash, ctx, 'blue');


  requestAnimationFrame(t => redraw(t, socket, canvas, ctx));
};

/* +++++++++++++++++++++++++++++++ on +++++++++++++++++++ */

// moves the player given on move
const onMove = (sock) => {
  const socket = sock;
  socket.on('move', (data) => {
    if (gameRunning) { updatePlayer(data.playerPos, data); }
  });
};

const onNewcomer = (sock) => {
  const socket = sock;
  
  socket.on('newcomer', (data) => {
    addPlayer(data);
  });
  
}

// joins the game, sets up plyaer position
const onJoin = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {

    player_hash = data.hash;

    addPlayer(data);
  });
};

// removes given player from game
const onLeft = (sock) => {
  const socket = sock;

  socket.on('left', (data) => {
    delete players[data.playerPos];
  });
};
/* ------------------------------- on ------------------- */

// sets up initial app state
const init = () => {
  const canvas = document.querySelector('canvas');
  canvas.width = 510;
  canvas.height = 510;
  canvas.style.border = '1px solid blue';

  const socket = io.connect();

  socket.on('connect', () => {
    onJoin(socket);
    onMove(socket);
    onLeft(socket);
  });


  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;
