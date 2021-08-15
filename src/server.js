import express from 'express';
import http from 'http';
import { Server }  from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use("/public", express.static(__dirname + '/public'));

app.get("/", (req, res) => res.render('home'));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000")

const httpServer = http.createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket)=> {
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    // step 6 : server gets offer from Browser A and send it to Browser B
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });
    // step 11 : gets answer from Browser B and send it to Browser A
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
})

httpServer.listen(3000, handleListen);