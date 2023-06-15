import { Server } from 'socket.io';
import express from 'express';
import { createServer } from 'http';
import path from 'path'; 

const app = express();
const http = createServer(app); // Pass app to createServer()
const io = new Server(http); // Pass http to Server()
const port = process.env.PORT || 3000;

const publicPath = path.resolve('./');
app.use(express.static(publicPath));

app.get("/", function(req, res) {
    res.sendFile(path.join(publicPath, "index.html"));
});

io.on("connection", function(socket) {

    socket.on("user_join", function(data) {
        this.username = data;
        socket.broadcast.emit("user_join", data);
    });

    socket.on("chat_message", function(data) {
        data.username = this.username;
        socket.broadcast.emit("chat_message", data);
    });

    socket.on("disconnect", function(data) {
        socket.broadcast.emit("user_leave", this.username);
    });
});

http.listen(port, function() {
    console.log("Listening on *:" + port);
});