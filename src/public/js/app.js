const socket = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;
let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li)
};

const handleMessageSubmit = (e) => {
    e.preventDefault();
    const input = room.querySelector("input");
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
    const chatForm = room.querySelector("form");
    chatForm.addEventListener("submit", handleMessageSubmit);
};


const handleRoomSubmit = (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value= "";
};

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", ()=> {
    addMessage("Someone Joined!");
});

socket.on("bye", ()=> {
    addMessage("Someone Left")
})

// other client see message
socket.on("seeMessage", (message)=> {
    addMessage(message);
})