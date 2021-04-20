module.exports = ({ app }) => {
  const io = require("socket.io")();

  const users = {};
  const socketToRoom = {};

  io.on("connection", (socket) => {
    socket.on("createRoom", ({ creatorID, roomID, intervieweeID }) => { // 추후 입장에서 인터뷰이 모드 추가해야함
      if (!users[roomID]) {
        users[roomID] = {
          creator: creatorID,
          interviewee: intervieweeID,
          members: [],
        };

        socket.emit("createRoomSuccess", socket.id);

        return;
      }

      socket.emit("failToAccess", "room is already exists");
    });

    socket.on("requestJoin", (roomID, cb) => {      
      if (!users[roomID]) {
        users[roomID] = {
          members: [],
        };
      }

      socket.join(roomID);

      // const length = users[roomID].members.length;

      // if (length === 5) {
      //   console.log(400);
      //   socket.emit("failToAccess", "room is full");

      //   return;
      // }

      users[roomID].members.push(socket.id);
      socketToRoom[socket.id] = roomID;

      const targetUsers = users[roomID].members.filter((id) => id !== socket.id);
      
      socket.emit("successJoin", targetUsers);

      cb();
    });

    socket.on("sendingSignal", ({ calleeID, callerID, signal }) => {
      console.log("sending", callerID);
      io.to(calleeID).emit("sendingForUsers", { signal, callerID });
    });

    socket.on("returningSignal", ({ signal, callerID }) => {
      console.log("returning", callerID);
      io.to(callerID).emit("receivingReturnedSignal", { signal, calleeID: socket.id });
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
