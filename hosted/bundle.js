'use strict';

var players = {};
var bullets = {};
var player_hash = 0;

var socket = {};

var LEFT = 0;
var UP = 1;
var RIGHT = 2;
var DOWN = 3;

// left,  up,    right,  down
var move = [false, false, false, false];

var LOBBY_STATE = 0;
var LOADING_STATE = 1;
var WAITING_STATE = 2;
var RUNNING_STATE = 3;
var GAMEOVER_STATE = 4;
var gameState = LOBBY_STATE;

var gameSection = {};
var lobbySection = {};
var loadingSection = {};

var errorMessage = {};
var gameMessage = {};
var leaveRoomButton = {};

var mousePositionTimer = {};

// +++++++ the handler functions
var keyDownHandler = function keyDownHandler(e) {
  if (gameState !== RUNNING_STATE || !players[player_hash].alive) return;
  var keyPressed = e.which;
  var player = players[player_hash];
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

var keyUpHandler = function keyUpHandler(e) {
  if (gameState !== RUNNING_STATE || !players[player_hash].alive) return;
  var keyPressed = e.which;
  var player = players[player_hash];
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

var calculateMouseAngle = function calculateMouseAngle(e) {
  var rect = canvas.getBoundingClientRect();
  var mouse = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };

  players[player_hash].gunAngle = Math.atan2(mouse.y - players[player_hash].y, mouse.x - players[player_hash].x);
};
//TODO is this too much math too often? slow down sample rate??
var mouseMoveHandler = function mouseMoveHandler(e) {
  if (gameState !== RUNNING_STATE || !players[player_hash].alive) return;
  calculateMouseAngle(e);
};

var mouseClickHandler = function mouseClickHandler(e) {
  if (gameState !== RUNNING_STATE || players[player_hash].shot) return;
  var player = players[player_hash];
  if (!player.alive) return;
  calculateMouseAngle(e);

  var angle = player.gunAngle;
  var xper = Math.cos(angle);
  var yper = Math.sin(angle);
  var px = player.x + xper * player.radius;
  var py = player.y + yper * player.radius;

  var bullet = {
    hash: player_hash,
    x: px,
    y: py,
    prevX: px,
    prevY: py,
    destX: px,
    alpha: 0.05,
    destY: py,
    xpercent: xper,
    ypercent: yper
  };
  sendShot(bullet);
};

// -------

var setViewHostControl = function setViewHostControl(hosting) {
  var view = 'block';
  if (!hosting) view = 'none';

  document.querySelector('#host_controls').style.display = view;
};

var updateGameState = function updateGameState(state) {
  if (state < 0 || state > 4) return;

  gameState = state;

  if (state === LOBBY_STATE) {
    gameSection.style.display = 'none';
    loadingSection.style.display = 'none';

    lobbySection.style.display = 'block';
    stopDraw();
  } else if (state === LOADING_STATE) {
    gameSection.style.display = 'none';
    lobbySection.style.display = 'none';

    loadingSection.style.display = 'block';
    stopDraw();
  } else {
    if (gameState === WAITING_STATE) gameMessage.innerHTML = 'Waiting for Players';else if (gameState == RUNNING_STATE) gameMessage.innerHTML = "Game On!";

    lobbySection.style.display = 'none';
    loadingSection.style.display = 'none';

    gameSection.style.display = 'block';
    startDraw();
  }
};

var showError = function showError(msg) {
  errorMessage.querySelector('#error_text').innerHTML = msg;
  errorMessage.style.display = 'block';
};

// resets the current game state to waiting
var resetGameState = function resetGameState() {
  updateGameState(WAITING_STATE);
};

var startGame = function startGame() {
  updateGameState(RUNNING_STATE);
};

//moves the game ot the end state
var endGame = function endGame(winner) {
  if (winner === player_hash) gameMessage.innerHTML = 'You WIN! :D';else gameMessage.innerHTML = 'You LOSE! :p';

  leaveRoomButton.style.display = 'inline';

  updateGameState(GAMEOVER_STATE);
};

var enterLobby = function enterLobby() {
  updateGameState(LOBBY_STATE);
};

// exists the game, removes all game state vars
var exitGame = function exitGame() {
  deleteGame();
  leaveRoom();
  leaveRoomButton.style.display = 'none';
  enterLobby();
};

var loadElements = function loadElements() {
  gameSection = document.querySelector('#game');
  loadingSection = document.querySelector('#loading');
  lobbySection = document.querySelector('#lobby');
  errorMessage = document.querySelector('#error');
  gameMessage = document.querySelector('#game_msg');

  errorMessage.querySelector('#error_button').addEventListener('click', function (e) {
    e.preventDefault();
    errorMessage.style.display = "none";
    return false;
  });
};

// sets up initial app state
var init = function init() {
  loadElements(); //load constantly reference elements
  initializeLobby(); //initialize lobby elements

  initializeCanvas();

  socket = io.connect();

  setupSocket(socket);

  initializeHostControls();

  leaveRoomButton = document.querySelector('#leave_room_button');

  leaveRoomButton.addEventListener('click', function (e) {
    e.preventDefault();

    if (gameState !== GAMEOVER_STATE) return false;

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
"use strict";

var checkCollisions = function checkCollisions(c1, c2) {
  var dist = Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2);
  if (dist <= Math.pow(c1.radius - c2.radius, 2)) {
    return true;
  }
  return false;
};

var bulletOutBounds = function bulletOutBounds(bullet) {
  if (bullet.x + bullet.radius >= CANVAS_WIDTH || bullet.x - bullet.radius <= 0 || bullet.y + bullet.radius >= CANVAS_HEIGHT || bullet.y - bullet.radius <= 0) {
    return true;
  }
  return false;
};

var checkBullets_collision = function checkBullets_collision() {
  var pkeys = Object.keys(players);
  var bkeys = Object.keys(bullets);

  for (var b = 0; b < bkeys.length; b++) {
    var destroyBullet = false;
    var bkey = bkeys[b];
    var bullet = bullets[bkey];
    for (var p = 0; p < pkeys.length && !destroyBullet; p++) {
      var pkey = pkeys[p];
      var player = players[pkey];

      if (player.hash !== bullet.hash && player.alive) {
        var hit = checkCollisions(player, bullet);

        if (hit) {
          doHit(player);
          hostRemoveBullet(bullet);
          destroyBullet = true;
          player.alive = false;

          checkGameOver_update();
        }
      }
    }

    if (!destroyBullet && bulletOutBounds(bullet)) {
      hostRemoveBullet(bullet);
    }
  }
};
'use strict';

var animationID = 0;

var canvas;
var ctx;

var CANVAS_WIDTH = 500;
var CANVAS_HEIGHT = 500;

var initializeCanvas = function initializeCanvas() {
  canvas = document.querySelector('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvas.style.border = '1px solid blue';

  ctx = canvas.getContext('2d');
};

var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

var startDraw = function startDraw() {
  animationID = requestAnimationFrame(redraw);
};

var stopDraw = function stopDraw() {
  if (animationID === 0) return;
  cancelAnimationFrame(animationID);
};

var redraw = function redraw(time) {
  if (gameState === RUNNING_STATE) {
    updatePosition();
    if (isHost) updateBulletPositions();
  }

  ctx.clearRect(0, 0, 500, 500);

  var bkeys = Object.keys(bullets);

  //draw bullets first so they are under the firing player
  if (gameState === RUNNING_STATE) {
    for (var i = 0; i < bkeys.length; i++) {
      var bullet = bullets[bkeys[i]];

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

      if (bullet.hash === player_hash) {
        ctx.fillStyle = 'blue';
      } else {
        ctx.fillStyle = 'red';
      }

      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  }

  var keys = Object.keys(players);

  for (var _i = 0; _i < keys.length; _i++) {
    var player = players[keys[_i]];

    if (!player.alive) continue; /////////Don't Draw this guy


    if (gameState === RUNNING_STATE) {
      if (player.alpha < 1) player.alpha += 0.05;

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

    if (player.hash === player_hash) {
      ctx.fillStyle = 'blue';
    } else {
      ctx.fillStyle = 'red';
    }

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  //set our next animation frame
  animationID = requestAnimationFrame(redraw);
};
'use strict';

var isHost = false;

var playerOrder = [];

var initializeHostControls = function initializeHostControls() {
  document.querySelector('#host_start').addEventListener('click', function (e) {
    e.preventDefault();
    if (!isHost || gameState !== WAITING_STATE) {
      return false;
    }

    socket.emit('gameStart', {});
    startGame();
  });
};

var setupTank = function setupTank(data) {
  var tank = data;
  var num = playerOrder.length;
  var r = tank.radius;

  players[data.hash] = tank;

  playerOrder.push(tank.hash);
  switch (num) {
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

var removePlayerFromHost = function removePlayerFromHost(hash) {
  if (!isHost) return;

  playerOrder.splice(0, playerOrder.length);

  var keys = Object.keys(players);
  for (var i = 0; i < keys.length; i++) {
    var tank = players[keys[i]];
    tank = setupTank(tank);
  }
  socket.emit('playerJoined', players);
};

var setHostListen = function setHostListen(hosting, tank) {
  isHost = hosting;
  setViewHostControl(hosting);
  if (hosting) {
    player_hash = tank.hash;

    setupTank(tank);

    socket.on('move', function (data) {
      updatePlayer_update(data);
      players[data.hash].lastUpdate = new Date().getTime();
      socket.emit('hostMove', players[data.hash]);
    });

    socket.on('shoot', function (data) {
      if (!data || !data.hash) return;

      if (!players[data.hash] || players[data.hash].shot) return;

      if (gameState !== RUNNING_STATE) return;
      addBullet(data);
      sendBulletUpdates();
    });

    socket.on('addPlayer', function (data) {
      doPlayerJoin(data);
    });

    updateGameState(WAITING_STATE);
  } else {
    socket.off('move');
    socket.off('shoot');
    socket.off('addPlayer');
  }
};

var gameOver = function gameOver(hash) {
  socket.emit('gameOver', { winner: hash });
  console.log(hash);
  endGame(hash);
};

var sendBulletUpdates = function sendBulletUpdates() {
  socket.emit('hostShots', bullets);
};

var addBullet = function addBullet(bull) {
  var bullet = bull;
  bullet.radius = 10;
  bullets[bullet.hash] = bullet;
  players[bullet.hash].shot = true;
};

var hostRemoveBullet = function hostRemoveBullet(bullet) {
  removeBullet(bullet);
  socket.emit('removeBullet', bullet);
};

var doMovement = function doMovement(data) {
  if (!isHost) return;
  socket.emit('hostMove', data);
};

var doHit = function doHit(data) {
  if (!isHost) return;
  socket.emit('hostHit', data);
};

var doPlayerJoin = function doPlayerJoin(data) {
  if (!isHost) return;
  var tank = setupTank(data);
  socket.emit('playerJoined', players);
};
'use strict';

var gamelist = {};

var OPEN = 0;
var FULL = 1;
var STARTED = 2;
var OVER = 3;
var roomStatus = [['room open!', 'room_open'], ['room full!', 'room_full'], ['game started!', 'room_started'], ['game over!', 'room_over']];

var lobbyList = {};
var noRoomsNotification = {};

var initializeLobby = function initializeLobby() {
  lobbyList = document.querySelector("#lobby_list");
  noRoomsNotification = document.querySelector('#no_rooms');

  var nameText = document.querySelector('#room_name_input');
  document.querySelector('#create_room_button').addEventListener('click', function (e) {
    e.preventDefault(true);
    if (nameText.value === '') {
      return false;
    }
    createRoom(nameText.value);
    nameText.value = "";
    return false;
  });
};

var initRoom = function initRoom(name) {
  var li = document.createElement('li');

  var namep = document.createElement('p');
  namep.classList.add("room_name");

  var countp = document.createElement('p');
  countp.classList.add("room_count");

  var statusp = document.createElement('p');
  statusp.classList.add("room_status");

  li.appendChild(namep);
  li.appendChild(countp);
  li.appendChild(statusp);
  roomClick(li);

  return li;
};

var roomClick = function roomClick(roomli) {
  var li = roomli;

  li.addEventListener('click', function (e) {
    e.preventDefault();
    if (gameState !== LOBBY_STATE) {
      return false;
    } else if (!li.classList.contains(roomStatus[OPEN][1])) {
      return false;
    }
    var room = li.querySelector('.room_name').innerHTML;
    joinRoom(room);
    return false;
  });
};

var setupRoom = function setupRoom(roomli, name, count, status) {
  var li = roomli;
  li.querySelector('.room_name').innerHTML = name;
  li.querySelector('.room_count').innerHTML = 'Players: ' + count;
  li.querySelector('.room_status').innerHTML = roomStatus[status][0];

  for (var i = 0; i < roomStatus.length; i++) {
    li.classList.remove(roomStatus[i][1]);
  }
  li.classList.add(roomStatus[status][1]);
  li.id = 'lobby_room_' + name;
};

var manageLobby = function manageLobby(data) {
  var keys = Object.keys(data);

  if (keys.length === 0) {
    return;
  }

  var li = {};

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var room = data[key];
    if (room.players.length > 0) {

      var existed = true;
      if (gamelist[key]) {
        li = lobbyList.querySelector('#lobby_room_' + key);
        if (li == null) {
          li = initRoom(gamelist[keys[i]]);
          existed = false;
        }
      } else {
        li = initRoom(gamelist[keys[i]]);
        existed = false;
      }

      gamelist[key] = room;

      var status = OPEN;

      if (room.full) {
        status = FULL;
      } else if (room.started) {
        status = STARTED;
      } else if (room.over) {
        status = OVER;
      }

      setupRoom(li, key, room.players.length, status);

      if (!existed) lobbyList.appendChild(li);
    } else {
      var offender = lobbyList.querySelector('#lobby_room_' + key);
      if (offender) lobbyList.removeChild(offender);
      delete gamelist[key];
    }
  }

  lobbyList.style.display = 'block';

  if (Object.keys(gamelist).length === 0) {
    lobbyList.style.display = 'none';
  }
};
'use strict';

/*
+++++++++++++++++++++++++++++++++++++++++ Client Socket emission
*/

var joinRoom = function joinRoom(room) {
  if (!room) return;

  updateGameState(LOADING_STATE);

  document.querySelector('#host_controls').style.display = 'none';
  socket.emit('join', { room: room });
};

var leaveRoom = function leaveRoom() {
  socket.emit('leave', {});
};

var createRoom = function createRoom(room) {
  socket.emit('createRoom', { room: room });
  updateGameState(LOADING_STATE);
};

var sendShot = function sendShot(bullet) {
  if (players[player_hash].shot) return;

  if (isHost) {
    addBullet(bullet);
  } else {
    socket.emit('shoot', bullet);
  }
};

var clientMove = function clientMove(player) {
  socket.emit('move', player);
};

/*
----------------------------------------- Client Socket emission
*/

/*
+++++++++++++++++++++++++++++++++++++++++ Client Socket reception
*/
var onMove = function onMove(sock) {
  var socket = sock;

  socket.on('updatedMovement', function (data) {
    updatePlayer_update(data);
  });
};

var onShot = function onShot(sock) {
  var socket = sock;

  socket.on('updateBullets', function (data) {
    updateBullets_update(data);
  });
};

var onRemoveBullet = function onRemoveBullet(sock) {
  var socket = sock;

  socket.on('removeBullet', function (data) {
    if (data.hash === player_hash) {
      players[player_hash].shot = false;
    }
    removeBullet(data);
  });
};

var onHit = function onHit(sock) {
  var socket = sock;

  socket.on('hit', function (data) {
    killPlayer(data);
  });
};

var onPlayerJoined = function onPlayerJoined(sock) {
  var socket = sock;

  socket.on('playerJoined', function (data) {
    addPlayers_update(data);
  });
};

var onUpdateBullets = function onUpdateBullets(sock) {
  var socket = sock;

  socket.on('updateBullets', function (data) {
    updateBullets_update(data);
  });
};

var onReset = function onReset(sock) {
  var socket = sock;

  socket.on('resetGame', function (data) {
    resetGame(data);
  });
};

var onGameOver = function onGameOver(sock) {
  var socket = sock;

  socket.on('gameOver', function (data) {
    if (!data || !data.winner) {
      return;
    }
    endGame(data.winner);
  });
};

var onLobby = function onLobby(sock) {
  var socket = sock;

  socket.on('updateLobby', function (data) {
    manageLobby(data);
  });
};

var onLeft = function onLeft(sock) {
  var socket = sock;

  socket.on('left', function (data) {
    removeUser(data.hash);
  });
};

var onHost = function onHost(sock) {
  var socket = sock;

  socket.on('hostOn', function (data) {
    setHostListen(true, data);
  });

  socket.on('hostOff', function () {
    setHostListen(false);
  });
};

var onErr = function onErr(sock) {
  var socket = sock;

  socket.on('err', function (data) {
    exitGame();
    if (data && data.msg) showError(data.msg);
  });
};

var onGetHash = function onGetHash(sock) {
  var socket = sock;

  socket.on('getHash', function (data) {
    player_hash = data.hash;
  });
};

var onStartGame = function onStartGame(sock) {
  var socket = sock;

  socket.on('startGame', function () {
    startGame();
  });
};

var onHostLeft = function onHostLeft(sock) {
  var socket = sock;

  socket.on('hostLeft', function () {
    exitGame();
    showError('host left');
  });
};

/*
----------------------------------------- Client Socket reception
*/

var setupSocket = function setupSocket() {
  socket.on('connect', function () {
    onHostLeft(socket);
    onGetHash(socket);
    onLeft(socket);
    onStartGame(socket);
    onMove(socket);
    onShot(socket);
    onRemoveBullet(socket);
    onReset(socket);
    onHit(socket);
    onPlayerJoined(socket);
    onGameOver(socket);
    onLobby(socket);
    onErr(socket);
    onHost(socket);
  });
};
"use strict";

var directions = {
  DOWNLEFT: 0,
  DOWN: 1,
  DOWNRIGHT: 2,
  LEFT: 3,
  UPLEFT: 4,
  RIGHT: 5,
  UPRIGHT: 6,
  UP: 7
};

var PLAYER_SPEED = 2;
var BULLET_SPEED = 4;

var updatePlayer_update = function updatePlayer_update(player) {
  if (!players[player.hash]) {
    players[player.hash] = player;
    return;
  }

  if (player.hash === player_hash) return;

  if (players[player.hash].lastUpdate >= player.lastUpdate && !isHost) return;
  var play = players[player.hash];

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

var updateBullets_update = function updateBullets_update(data) {

  var keys = Object.keys(data);

  for (var i = 0; i < keys.length; i++) {
    var bullet = data[keys[i]];

    if (!bullets[bullet.hash]) {
      bullets[bullet.hash] = bullet;
      players[bullet.hash].shot = true;
      continue;
    }

    if (bullets[bullet.hash].lastUpdate >= bullet.lastUpdate) return;

    var bull = bullets[bullet.hash];

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

var addPlayers_update = function addPlayers_update(data) {
  if (gameState === LOADING_STATE) {
    updateGameState(WAITING_STATE);
  }
  var keys = Object.keys(data);

  for (var i = 0; i < keys.length; i++) {
    players[keys[i]] = data[keys[i]];
  }
};

var checkGameOver_update = function checkGameOver_update() {
  var hash = 0;
  var count = 0;

  var keys = Object.keys(players);

  for (var i = 0; i < keys.length; i++) {
    if (players[keys[i]].alive) {
      count++;
      hash = keys[i];
    }
  }
  if (count === 1) {
    gameOver(hash);
  }
};

var removeUser = function removeUser(hash) {
  if (players[hash]) delete players[hash];
  if (gameState === WAITING_STATE) removePlayerFromHost(hash);
};

var killPlayer = function killPlayer(data) {
  players[data.hash].alive = false;
};

var deleteGame = function deleteGame() {
  var keys = Object.keys(players);

  for (var i = 0; i < keys.lengh; i++) {
    delete players[keys[i]];
  };

  var bkeys = Object.keys(bullets);

  while (playerOrder.length > 0) {
    playerOrder.pop();
  }

  for (var _i = 0; _i < bkeys.length; _i++) {
    delete bullets[bkeys[_i]];
  }
};

var removeBullet = function removeBullet(bullet) {
  delete bullets[bullet.hash];
  players[bullet.hash].shot = false;
};

var resetGame = function resetGame(data) {
  deleteGame();

  var nkeys = Object.keys(data);

  for (var i = 0; i < nkeys.length; i++) {
    players[nkeys[i]] = data[nkeys[i]];
  };

  resetGameState();
};

var updatePosition = function updatePosition() {
  var player = players[player_hash];

  player.prevX = player.x;
  player.prevY = player.y;

  if (player.moveUp && player.destY > player.radius) {
    player.destY -= PLAYER_SPEED;
  }

  if (player.moveDown && player.destY < CANVAS_HEIGHT - player.radius) {
    player.destY += PLAYER_SPEED;
  }

  if (player.moveLeft && player.destX > player.radius) {
    player.destX -= PLAYER_SPEED;
  }

  if (player.moveRight && player.destX < CANVAS_WIDTH - player.radius) {
    player.destX += PLAYER_SPEED;
  }

  if (player.moveUp && player.moveLeft) player.direction = directions.UPLEFT;else if (player.moveUp && player.moveRight) player.direction = directions.UPRIGHT;else if (player.moveDown && player.moveLeft) player.direction = directions.DOWNLEFT;else if (player.moveDown && player.moveRight) player.direction = directions.DOWNRIGHT;else if (player.moveDown && !(player.moveRight || player.moveLeft)) player.direction = directions.DOWN;else if (player.moveUp && !(player.moveRight || player.moveLeft)) player.direction = directions.UP;else if (player.moveLeft && !(player.moveUp || player.moveDown)) player.direction = directions.LEFT;else if (player.moveRight && !(player.moveUp || player.moveDown)) player.direction = directions.RIGHT;

  player.alpha = 0.05;

  if (isHost) {
    player.lastUpdate = new Date().getTime();
    doMovement(player);
  } else {
    clientMove(player);
  }
};

var updateBulletPositions = function updateBulletPositions() {
  if (!isHost) return;

  var keys = Object.keys(bullets);

  for (var i = 0; i < keys.length; i++) {
    var bullet = bullets[keys[i]];
    var xp = bullet.xpercent;
    var yp = bullet.ypercent;

    bullet.prevX = bullet.x;
    bullet.prevY = bullet.y;

    bullet.destX += xp * BULLET_SPEED;
    bullet.destY += yp * BULLET_SPEED;
    bullet.lastUpdate = new Date().getTime();
  }
  sendBulletUpdates();
  checkBullets_collision();
};
