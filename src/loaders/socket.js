module.exports = ({ app }) => {
  const io = require("socket.io")();

  io.on("connection", (socket) => {
    console.log(socket.id);
    socket.on("join room", ({ room }) => {
      socket.join(room);

      const currentMembers = io.of("/").adapter.rooms.get(room);
      
      if (currentMembers.has(room)) {
        const memberCount = currentMembers.length;

        if (memberCount === 5) {
          socket.emit("room full");

          return;
        }

        const antherUsers = currentMembers.filter((id) => id !== socket.id);

        io.sockets.emit("all users", antherUsers);
      }

      socket.on("sending signal", (payload) => {
        io.to(payload.userToSignal).emit("user joined", { signal: payload.signal, callerId: payload.callerId });
      });

      socket.on("returning signal", (payload) => {
        io.to(payload.callerId).emit("receiving returned signal", { signal: payload.signal, id: socket.id });
      });

      socket.on("disconnect", ({ room }) => {
        socket.leave(room);
      });
    });

    // socket.on("signaling", (toId, message) => {
    //   io.to(toId).emit("signaling", socket.id, message);
    // });

    socket.on("icecandidate", (toId, message) => {
      console.log(toId);
      io.to(toId).emit("icecandidate", socket.id, message);
    });

    socket.on("offer", (toId, message) => {
      console.log(toId);
      io.to(toId).emit("offer", socket.id, message);
    });

    socket.on("answer", (toId, message) => {
      console.log(toId);
      io.to(toId).emit("answer", socket.id, message);
    });

    socket.on("disconnect", () => {
      io.sockets.emit("user-left", socket.id);
    });
  });

  app.io = io;
};
