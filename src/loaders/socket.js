module.exports = ({ app }) => {
  const io = require("socket.io")();

  const users = {};
  const socketToRoom = {};

  io.on("connection", (socket) => {
    socket.on("createRoom", ({ creatorID, roomID }) => {
      if (!users[roomID]) {
        users[roomID] = {
          creator: creatorID,
          members: [],
        };

        socket.emit("createRoomSuccess", socket.id);

        return;
      }

      socket.emit("failToAccess", "room is already exists");
    });

    socket.on("requestJoin", (roomID, cb) => {
      if (!users[roomID]) {
        socket.emit("failToAccess", "room is not exists");

        return;
      }

      const length = users[roomID].members.length;

      if (length === 5) {
        socket.emit("failToAccess", "room is full");

        return;
      }

      users[roomID].members.push(socket.id);
      socketToRoom[socket.id] = roomID;

      const targetUsers = users[roomID].members.filter(id => id !== socket.id);

      socket.emit("successJoin", targetUsers);

      return cb();
    });

    socket.on("sendingSignal", (payload) => {
      io.to(payload.userToSignal).emit("sendingForUsers", { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returningSignal", (payload) => {
      io.to(payload.callerID).emit("receivingReturnedSignal", { signal: payload.signal, id: socket.id });
    });

    socket.on("leaveRoom", () => {
      const roomID = socketToRoom[socket.id];

      if (users[roomID]) {
        const leftUsers = users[roomID].members.filter(id => id !== socket.id);

        if (users.length === 0) {
          delete users[roomID];

          socket.emit("clearRoom");

          return;
        }

        users[roomID].members = leftUsers;

        socket.emit("successToLeave");
      }
    });
  });

  app.io = io;
};
