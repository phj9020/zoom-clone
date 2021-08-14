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
    socket.on("join_room", (roomName, startMedia) => {
        socket.join(roomName);
        startMedia();
        socket.to(roomName).emit("welcome");
    })
})

httpServer.listen(3000, handleListen);