module.exports = ({ app }) => {
  const io = require("socket.io")();

  const interviewRoom = {};

  const interview = io.of("/interview-socket").on("connection", (socket) => {
    socket.on("joinRoom", ({ roomId }) => {
      const room = roomId;

      socket.join(room);

      if (!interviewRoom[roomId]) {
        interviewRoom[roomId] = {};
      }
    });

    socket.on("leaveRoom", ({ roomId, userId }) => {
      const room = roomId;

      socket.leave(room);

      const roomInfos = interviewRoom[roomId];

      if (roomInfos && userId in roomInfos) {
        delete roomInfos[userId];
      }
    });

    socket.on("signal", ({ toId, message }) => {
      socket.broadcast.to(toId).emit("signal", socket.id, message);
    });
  });

  app.io = io;
};
