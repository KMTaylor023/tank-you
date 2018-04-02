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
  noRoomsNotification = document.querySelector('#no_rooms');
  
  const nameText = document.querySelector('#room_name_input');
  document.querySelector('#create_room_button').addEventListener('click', (e) => {
    e.preventDefault(true);
    if (nameText.value === '') {
      return false;
    }
    createRoom(nameText.value);
    return false;
  });
  
};

const initRoom = (name) => {
  const li = document.createElement('li');
  
  const namep = document.createElement('p');
  namep.classList.add("room_name");
  
  const countp = document.createElement('p');
  countp.classList.add("room_count");
  
  const statusp = document.createElement('p');
  statusp.classList.add("room_status");
  
  li.appendChild(namep);
  li.appendChild(countp);
  li.appendChild(statusp);
  roomClick(li);
  
  return li;
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
    const room = li.querySelector('.room_name').innerHTML;
    joinRoom(room);
    return false;
  });
}


const setupRoom = (roomli, name, count, status) => {
  const li = roomli;
  li.querySelector('.room_name').innerHTML = name;
  li.querySelector('.room_count').innerHTML = `Players: ${count}`;
  li.querySelector('.room_status').innerHTML = roomStatus[status][0];
  
  for(let i = 0; i < roomStatus.length; i++){
    li.classList.remove(roomStatus[i][1]);
  }
  li.classList.add(roomStatus[status][1]);
  li.id = `lobby_room_${name}`;
};

const manageLobby = (data) => {
  const keys = Object.keys(data);
  
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
          li = initRoom(gamelist[keys[i]]);
          existed = false
        }
      }
      else{
        li = initRoom(gamelist[keys[i]]);
        existed = false;
      }
      
      gamelist[key] = room;
      
      let status = OPEN;
      
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
      const offender = lobbyList.querySelector(`#lobby_room_${key}`);
      if(offender) lobbyList.removeChild(offender);
      delete gamelist[key];
    }
  }
  
  lobbyList.style.display = 'block';
  
  if(Object.keys(gamelist).length === 0){
    lobbyList.style.display = 'none';
  }
};