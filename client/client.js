const players = {};
const bullets = {};
var player_hash = 0;

var socket = {};

const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;

// left,  up,    right,  down
const move = [false, false, false, false];

const LOBBY_STATE = 0;
const LOADING_STATE = 1;
const WAITING_STATE = 2;
const RUNNING_STATE = 3;
const GAMEOVER_STATE = 4;
var gameState = LOBBY_STATE;

var gameSection = {};
var lobbySection = {};
var loadingSection = {};

var errorMessage = {};
var gameMessage = {};
var leaveRoomButton = {};

var mousePositionTimer = {};


// +++++++ the handler functions
const keyDownHandler = (e) => {
  if(gameState !== RUNNING_STATE || !players[player_hash].alive) return;
  const keyPressed = e.which;
  const player = players[player_hash];
  if (keyPressed === 87 || keyPressed === 38) {
    player.moveUp = true;
  }
  if (keyPressed === 65 || keyPressed === 37) {
    player.moveLeft = true;
  }
  if (keyPressed === 83 || keyPressed === 40) {
    player.moveDown = true;
  } 
  if (keyPressed === 68 || keyPressed === 39) {
    player.moveRight = true;
  }
  if (move[UP] || move[LEFT] || move[DOWN] || move[RIGHT]) {
    e.preventDefault(true);
  }
};

const keyUpHandler = (e) => {
  if(gameState !== RUNNING_STATE || !players[player_hash].alive) return;
  const keyPressed = e.which;
  const player = players[player_hash];
  if (keyPressed === 87 || keyPressed === 38) {
    player.moveUp = false;
  } 
  if (keyPressed === 65 || keyPressed === 37) {
    player.moveLeft = false;
  } 
  if (keyPressed === 83 || keyPressed === 40) {
    player.moveDown = false;
  } 
  if (keyPressed === 68 || keyPressed === 39) {
    player.moveRight = false;
  }
};

const calculateMouseAngle = (e) => {
  let rect = canvas.getBoundingClientRect();
  const mouse = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  
  players[player_hash].gunAngle = Math.atan2(
          mouse.y - players[player_hash].y, 
          mouse.x - players[player_hash].x);
}
//TODO is this too much math too often? slow down sample rate??
const mouseMoveHandler = (e) => {
  if(gameState !== RUNNING_STATE || !players[player_hash].alive) return;
  calculateMouseAngle(e);
};

const mouseClickHandler = (e) => {
  if(gameState !== RUNNING_STATE || players[player_hash].shot) return;
  const player = players[player_hash];
  if(!player.alive) return;
  calculateMouseAngle(e);
  
  const angle = player.gunAngle;
  const xper = Math.cos(angle);
  const yper = Math.sin(angle);
  const px = player.x + (xper*player.radius);
  const py = player.y + (yper*player.radius);
  
  const bullet = {
    hash: player_hash,
    x: px,
    y: py,
    prevX: px,
    prevY: py,
    destX: px,
    alpha: 0.05,
    destY: py,
    xpercent: xper,
    ypercent: yper,
  }
  sendShot(bullet);
};


// -------

const setViewHostControl = (hosting) => {
  let view = 'block';
  if(!hosting) view = 'none';
  
  document.querySelector('#host_controls').style.display = view;
};

const updateGameState = (state) => {
  if(state < 0 || state > 4) return;
  
  gameState = state;
  
  if(state === LOBBY_STATE){
    gameSection.style.display = 'none';
    loadingSection.style.display = 'none';
    
    lobbySection.style.display = 'block';
    stopDraw();
  } else if (state === LOADING_STATE){
    gameSection.style.display = 'none';
    lobbySection.style.display = 'none';
    
    loadingSection.style.display = 'block';
    stopDraw();
  } else {
    if(gameState === WAITING_STATE) gameMessage.innerHTML = 'Waiting for Players';
    else if (gameState == RUNNING_STATE) gameMessage.innerHTML = "Game On!";
    
    lobbySection.style.display = 'none';
    loadingSection.style.display = 'none';
    
    gameSection.style.display = 'block';
    startDraw();
  }
}

const showError = (msg) => {
  errorMessage.querySelector('#error_text').innerHTML = msg;
  errorMessage.style.display = 'block';
}

// resets the current game state to waiting
const resetGameState = () => {
  updateGameState(WAITING_STATE);
};

const startGame = () => {
  updateGameState(RUNNING_STATE);
};

//moves the game ot the end state
const endGame = (winner) => {
  if(winner === player_hash) gameMessage.innerHTML = 'You WIN! :D';
  else gameMessage.innerHTML = 'You LOSE! :p';
  
  leaveRoomButton.style.display = 'inline';
  
  updateGameState(GAMEOVER_STATE);
};

const enterLobby = () => {
  updateGameState(LOBBY_STATE);
};

// exists the game, removes all game state vars
const exitGame = () => {
  deleteGame();
  leaveRoom();
  leaveRoomButton.style.display = 'none';
  enterLobby();
};


const loadElements = () => {
  gameSection = document.querySelector('#game')
  loadingSection = document.querySelector('#loading');
  lobbySection = document.querySelector('#lobby');
  errorMessage = document.querySelector('#error');
  gameMessage = document.querySelector('#game_msg');
  
  errorMessage.querySelector('#error_button').addEventListener('click', (e) => {
    e.preventDefault();
    errorMessage.style.display = "none";
    return false;
  });
}

// sets up initial app state
const init = () => {
  loadElements();//load constantly reference elements
  initializeLobby();//initialize lobby elements
  
  initializeCanvas();
  

  socket = io.connect();

  setupSocket(socket);
  
  initializeHostControls();
  
  leaveRoomButton = document.querySelector('#leave_room_button');
  
  leaveRoomButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    if(gameState !== GAMEOVER_STATE) return false;
    
    exitGame();
    return false;
  });


  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
  
  canvas.addEventListener('mousemove', mouseMoveHandler);
  canvas.addEventListener('click', mouseClickHandler);
  
  enterLobby();
};

window.onload = init;
