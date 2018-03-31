const players = {};
var player_hash = 0;

var socket = {};

var canvas;
var ctx;

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

var mousePositionTimer = {};


// +++++++ the handler functions
const keyDownHandler = (e) => {
  if(gameState !== RUNNING_STATE) return;
  const keyPressed = e.which;
  if (keyPressed === 87 || keyPressed === 38) {
    move[UP] = true;
  }
  if (keyPressed === 65 || keyPressed === 37) {
    move[LEFT] = true;
  }
  if (keyPressed === 83 || keyPressed === 40) {
    move[DOWN] = true;
  } 
  if (keyPressed === 68 || keyPressed === 39) {
    move[RIGHT] = true;
  }
  if (move[UP] || move[LEFT] || move[DOWN] || move[RIGHT]) {
    e.preventDefault(true);
  }
};

const keyUpHandler = (e) => {
  if(gameState !== RUNNING_STATE) return;
  const keyPressed = e.which;
  if (keyPressed === 87 || keyPressed === 38) {
    move[UP] = false;
  } 
  if (keyPressed === 65 || keyPressed === 37) {
    move[LEFT] = false;
  } 
  if (keyPressed === 83 || keyPressed === 40) {
    move[DOWN] = false;
  } 
  if (keyPressed === 68 || keyPressed === 39) {
    move[RIGHT] = false;
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
  if(gameState !== RUNNING_STATE) return;
  
  calculateMouseAngle(e);
};

const mouseClickHandler = (e) => {
  if(gameState !== RUNNING_STATE || players[player_hash].shot) return;
  
  calculateMouseAngle(e);
  sendShot();
  
}


// -------

const updateGameState = (state) => {
  if(state < 0 || state > 4) return;
  
  gameState = state;
  
  if(state === LOADING_STATE){
    gameSection.style.display = 'none';
    loadingSection.style.display = 'none';
    
    lobbySection.style.display = 'block';
  } else if (state === LOADING_STATE){
    gameSection.style.display = 'none';
    lobbySection.style.display = 'none';
    
    loadingSection.style.display = 'block';
  } else {
    lobbySection.style.display = 'none';
    loadingSection.style.display = 'none';
    
    gameSection.style.display = 'block';
  }
}

const showError = (msg) => {
  errorMessage.querySelector('#error_text').innerHTML = msg;
  errorMessage.style.display = 'block';
}

// resets the current game state to waiting
const resetGame = () => {
  updateGameState(WAITING_STATE);
};

const startGame = () => {
  
};

//moves the game ot the end state
const endGame = (winner) => {
  if(!players[winner]){
    return;
  }

  //TODO winner
};

const deleteGame = () => {
  
};

// exists the game, removes all game state vars
const exitGame = () => {
  
  deleteGame();
};

const enterLobby = () => {
  updateGameState(LOBBY_STATE);
}


const loadElements = () => {
  gameSection = document.querySelector('#game')
  loadingSection = document.querySelector('#loading');
  lobbySection = document.querySelector('#lobby');
  errorMessage = document.querySelector('#error');
  
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
  
  const canvas = document.querySelector('canvas');
  canvas.width = 510;
  canvas.height = 510;
  canvas.style.border = '1px solid blue';
  

  socket = io.connect();

  socket.on('connect', () => {
    onJoin(socket);
    onMove(socket);
    onLeft(socket);
  });


  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
  
  enterLobby();
};

window.onload = init;
