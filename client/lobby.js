const gamelist = {};

const OPEN = 0;
const FULL = 1;
const STARTED = 2;
const OVER = 3;
const roomStatus = [['room open!', 'room_open'],
                    ['room full!', 'room_full'],
                    ['game started!', 'room_started'],
                    ['game over!', 'room_over'],
                   ];

var lobbyList = {};
var noRoomsNotification = {};


const initializeLobby = () => {
  lobbyList = document.querySelector("#lobby_list");
  noRoomsNotification = document.querySelector('#no_rooms')
};

const roomClick = (roomli) => {
  const li = roomli;
  
  li.addEventListener('click', (e) => {
    e.preventDefault();
    
    if(gameState !== LOBBY_STATE){
      return false;
    }else if(!li.classList.contains(roomStatus[OPEN][1])){
      return false;
    }
    
    const room = li.getAttribute('room');
    
    joinRoom(room);
    return false;
  });
}

const createRoom = (name) => {
  let li = document.createElement('li');
  let namep = document.createElement('p').classList.append("room_name");
  let countp = document.createElement('p').classList.append("room_count");
  let statusp = document.createElement('p').classList.append("room_status");
  li.append(nameP);
  li.append(countp);
  li.append(statusp);
  
  roomClick(li);
  
  return li;
};

const setupRoom = (roomli, name, count, status) => {
  const li = roomli;
  
  li.querySelector('.room_name').innerHTML = name;
  li.querySelector('.room_count').innerHTML = `Players: ${count}`;
  li.querySelector('.room_status').innerHTML = roomStatus[status][0];
  
  for(let i = 0; i < roomStatus.length; i++){
    li.classList.remove(roomStatus[i][1]);
  }
  li.classList.append(roomStatus[status][1]);
  li.id = `lobby_room_${name}`;
};

const manageLobby = (data, sock) => {
  const keys = Object.keys(rooms);

  if (keys.length === 0) {
    return;
  }
  
  let li = {};
  
  for(let i = 0; i < keys.length; i++){
    const key = keys[i];
    const room = data[key];
    
    if(room.players.length > 0){
    
      let existed = true;
      if(gamelist[key]){
        li = lobbyList.querySelector(`#lobby_room_${key}`);
        if(li == null){
          li = createRoom(gamelist[keys[i]]);
          existed = false
        }
      }
      else{
        li = createRoom(gamelist[keys[i]]);
        existed = false;
      }
      
      gamelist[key] = room;
      
      let staus = OPEN;
      
      if(room.full){
        status = FULL;
      } else if(room.started){
        status = STARTED;
      }
      else if(room.over){
        status = OVER;
      }
      
      setupRoom(li, key, room.players.length, status);
      
      if(!existed) lobbyList.appendChild(li);
    }
    else{
      lobbyList.removeChild(lobbyList.querySelector(`lobby_room_${key}`));
      delete gamelist[key];
    }
  }
  
  gamelist.style.display = 'block';
  
  if(Object.keys(gamelist).length === 0){
    gamelist.style.display = 'none';
  }
};