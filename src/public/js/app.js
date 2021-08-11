const socket = io();

const welcome = document.querySelector("#welcome");
const form = welcome.querySelector("form");

function backendDone (msg){
    console.log(`Backend says ${msg}`);
}

const handleRoomSubmit = (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", {payload : input.value}, backendDone);
    input.value= "";
};

form.addEventListener("submit", handleRoomSubmit);