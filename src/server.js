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


function publicRooms(){
    const {sockets: {adapter : {sids, rooms}}} = io;
    const publicRooms = [];

    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined) {
            
            publicRooms.push(key);
        } 
    });
    return publicRooms;
};


io.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    })
    socket.on("enter_room", (roomname, showRoom)=> {
        // join the room
        socket.join(roomname);
        // execute frontend showRoom fn
        showRoom();
        // let others know someone enters a room exclude me
        socket.to(roomname).emit("welcome", socket.nickname);
        // store roomname in socket object
        socket["roomname"] = roomname;
        // when someone enters a room broadcast everyone in the apllication  
        io.sockets.emit("room_change", publicRooms());
    });
    
    socket.on("disconnecting", ()=> {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
    });
    
    socket.on("disconnect", ()=>{
        io.sockets.emit("room_change", publicRooms());
    })

    socket.on("new_message", (message, roomName, done) => {
        // show message other side clients in same room
        socket.to(roomName).emit("seeMessage", `${socket.nickname}: ${message}`);
        done();
    });

    // store nickname in socket object
    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname;
    });

});


httpServer.listen(3000, handleListen);