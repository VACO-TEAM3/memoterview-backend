module.exports = ({ app }) => {
  const io = require("socket.io")();

  const users = {};
  const rooms = {};

  io.on("connection", (socket) => {
    socket.on("requestJoinRoom", ({ roomID, userData }) => {
      if (!rooms[roomID]) {
        rooms[roomID] = {
          members: [],
        };
      }

      if (rooms[roomID].members.length > 20) {
        socket.emit("room is full");

        return;
      }

      rooms[roomID].members.push({ ...userData, socketID: socket.id });
      users[socket.id] = userData;

      socket.join(roomID);

      const targetUsers = rooms[roomID].members.filter((member) => member.socketID !== socket.id);

      socket.emit("successJoinUser", targetUsers);
      console.log(socket.id);
    });

    socket.on("sendSignal", ({ callee, caller, signal }) => {
      console.log("sendSignal")
      io.to(callee).emit("joinNewUser", { signal, caller });
    });

    socket.on("returnSignal", ({ signal, caller }) => {
      console.log("returnSignal");
      io.to(caller).emit("receiveReturnSignal", { signal, id: socket.id });
    });
  });

  app.io = io;
};
