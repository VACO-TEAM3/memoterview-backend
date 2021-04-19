module.exports = ({ app }) => {
  const io = require("socket.io")();

  io.on("connection", (socket) => {
    socket.on("join room", ({ room }) => {
      socket.join(room);
      console.log(room);
      const members = Array.from(io.of("/").adapter.rooms.get(room));
      console.log(members);
      if (members) {
        const memberCount = members.length;

        if (memberCount === 5) {
          socket.emit("room full");

          return;
        }
 
        const currentUsers = members.filter((id) => id !== socket.id);
    
        io.sockets.emit("all users", currentUsers);
      }

      socket.on("sending signal", ({ userToSignal, callerId, signal }) => {
        io.to(userToSignal).emit("user joined", { signal, callerId });
      });

      socket.on("returning signal", ({ signal, callerId }) => {
        io.to(callerId).emit("receiving returned signal", { signal, id: socket.id });
      });

      socket.on("disconnect", ({ room }) => {
        socket.leave(room);
      });
    });

    // // socket.on("signaling", (toId, message) => {
    // //   io.to(toId).emit("signaling", socket.id, message);
    // // });

    // socket.on("icecandidate", (toId, message) => {
    //   console.log(toId);
    //   io.to(toId).emit("icecandidate", socket.id, message);
    // });

    // socket.on("offer", (toId, message) => {
    //   console.log(toId);
    //   io.to(toId).emit("offer", socket.id, message);
    // });

    // socket.on("answer", (toId, message) => {
    //   console.log(toId);
    //   io.to(toId).emit("answer", socket.id, message);
    // });

    // socket.on("disconnect", () => {
    //   io.sockets.emit("user-left", socket.id);
    // });
  });

  app.io = io;
};
