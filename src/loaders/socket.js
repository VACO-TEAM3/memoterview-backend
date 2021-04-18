module.exports = ({ app }) => {
  const io = require("socket.io")();

  io.on("connection", (socket) => {
    socket.on("join", ({ room }) => {
      socket.join(room);

      const currentMembers = io.of("/").adapter.rooms.get(room);
      
      io.sockets.emit("join", socket.id, Array.from(currentMembers));
    });

    socket.on("signaling", (toId, message) => {
      io.to(toId).emit("signaling", socket.id, message);
    });

    socket.on("message", (toId, message) => {
      console.log(toId, message);
      io.to(toId).emit("message", socket.id, message);
    });

    socket.on("disconnect", () => {
      io.sockets.emit("user-left", socket.id);
    });
  });

  app.io = io;
};
