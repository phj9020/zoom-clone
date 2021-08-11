const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nicknameForm = document.querySelector("#nickname");

// opening connection to backend
const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
    const msg = {type, payload}
    return JSON.stringify(msg);
}

socket.addEventListener("open", ()=> {
    console.log("Connected to Server")
});

socket.addEventListener("message", (message)=> {
    const li = document.createElement("li");
    console.log(message.data)
    li.innerHTML = message.data;
    messageList.appendChild(li);
    
});

socket.addEventListener("close", ()=> {
    console.log("Disconnected from Server")
});


const handleSubmit = (e) =>{
    e.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = ""
};

const handleNicknameSubmit = (e) =>{
    e.preventDefault();
    const input = nicknameForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit)