const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
app.use(cors());
const servers = http.createServer(app);
const socketio = require("socket.io");
const { env } = require("process");
const io = new socketio.Server(servers, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("conectado   " + socket.id);
  socket.rooms.add("hola");

  socket.on("CreateRomm", (room) => {
    const busqu = socket.rooms.has(room.nameRoom);
    if (!busqu) {
      socket.rooms.add(room.nameRoom);
      socket.emit("MsgRoom", `<-- ${room.nameRoom}--> room Creada`);
    } else {
      socket.emit(
        "MsgRoom",
        `ERRO!, La sala ${room.nameRoom} ya ha sido Creada`
      );
      socket.rooms.forEach((x) => console.log("room", x));
    }
  });

  socket.on("JoinSala", (room) => {
    socket.rooms.forEach((x) => console.log("room", x));
    console.log(room);
    const busqu = socket.rooms.has(room.nameRoom);
    if (busqu) {
      socket.join(room.nameRoom);
      socket.emit("msg-joinRoom", "Entrando a Sala");
      socket.to(room.nameRoom).emit("JoinRoom", {
        msg: `${room.userName} se ah unido a la sala`,
      });
      console.log("entrando a la sala...", room.nameRoom);
    } else {
      socket.emit("msg-joinRoom", "La sala no existe");
    }
  });

  socket.on("SendMessageRoom", (room) => {
    console.log(room);
    console.log("....enviando mensaje a rooomm : ", room.sala);

    socket.to(room.sala).emit("SendMessagetoRoom", {
      userName: room.userName,
      Mensaje: room.Mensaje,
    });
    socket.emit("SendMessagetoRoomEmisor", {
      userName: room.userName,
      Mensaje: room.Mensaje,
    });
  });

  socket.on("sendMessage", (data) => {
    console.log(data);
    socket.broadcast.emit("ReceptorMessage", data);
    socket.emit("EmisorMessage", data);
  });
});
io.socketsJoin("1");
console.log("LISTADO", io.socketsJoin("1"));

servers.listen(4000 || process.env.PORT, () => {
  console.log(" ***** listening on port 4000 ****");
});
