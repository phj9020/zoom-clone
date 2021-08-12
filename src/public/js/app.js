const socket = io();
const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const nicknameForm = welcome.querySelector("#nickname");
const messageForm = room.querySelector("#message");
const mynickname = document.querySelector("#myNickname");

room.hidden = true;
let roomName;
mynickname.innerText = "My nickname: Anonymous"

function setMyNickname(nickname) {
    mynickname.innerText = `My nickname: ${nickname}`;
}

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li)
};

const handleMessageSubmit = (e) => {
    e.preventDefault();
    const input = messageForm.querySelector("input");
    const value = input.value;
    // send socket event 
    socket.emit("new_message", input.value, roomName, ()=> {
        addMessage(`You : ${value}`);
    });
    input.value = "";
};



function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    messageForm.addEventListener("submit", handleMessageSubmit);
};

const handleNicknameSubmit = (e) => {
    e.preventDefault();
    const input = nicknameForm.querySelector("input");
    socket.emit("nickname", input.value);
    setMyNickname(input.value);
    input.value = "";
};

const handleRoomSubmit = (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value= "";
};

nicknameForm.addEventListener("submit", handleNicknameSubmit);
form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (nickname)=> {
    addMessage(`${nickname} enters the room`);
});

socket.on("bye", (nickname)=> {
    addMessage(`${nickname} left the room`)
})

// other client see message
socket.on("seeMessage", (message)=> {
    addMessage(message);
});

// listen room change event
socket.on("room_change", (rooms)=> {
    console.log(rooms)
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0) {
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = `room name: ${room}`;
        roomList.appendChild(li);
    });
})