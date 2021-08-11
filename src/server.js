import express from 'express';
import http from 'http';
import WebSocket from 'ws';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use("/public", express.static(__dirname + '/public'));

app.get("/", (req, res) => res.render('home'));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000")

const server = http.createServer(app);

const wss = new WebSocket.Server({server});

const onSocketClose = () => console.log("Disconnected from the Browser");


const sockets = [];

// opening connection to browser : socket
wss.on("connection", (socket) => {
    console.log("Connected to Browser");
    // when browser enters store in sockets array
    sockets.push(socket);
    // set default nickname as Anonymous
    socket["nickname"] = "Anonymous";
    
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch(message.type) {
            case "new_message": 
                // sockets 어레이에 있는 모든 소켓에게 메세지를 전달(client로)한다. 
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname} : ${message.payload}`));
                break;
            case "nickname": 
                // socket 객체안에 닉네임을 넣었다 
                socket["nickname"] = message.payload
                break;
            default:
                return;
        }
    });
    socket.on("close", onSocketClose)
});

server.listen(3000, handleListen);