import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use("/public", express.static(__dirname + '/public'));

app.get("/", (req, res) => res.render('home'));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000")

const httpServer = http.createServer(app);

const io = SocketIO(httpServer);

io.on("connection", (socket) => {
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    })
    socket.on("enter_room", (roomname, showRoom)=> {
        // join the room
        socket.join(roomname);
        // execute frontend showRoom fn
        showRoom();
        // let others know someone enters a room exclude me
        socket.to(roomname).emit("welcome");
        // store roomname in socket object
        // socket["roomname"] = roomname;
    });

    socket.on("disconnecting", ()=> {
        socket.rooms.forEach(room => socket.to(room).emit("bye"));
    });

    socket.on("new_message", (message, roomName, done) => {
        // to everyone in room, use io instead of socket
        socket.to(roomName).emit("seeMessage", message);
        done();
    });

});


httpServer.listen(3000, handleListen);