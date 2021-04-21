module.exports = ({ app }) => {
  const io = require("socket.io")();

  const users = {};
  const rooms = {};
  const socketToRoom = {};

  io.on("connection", (socket) => {
    socket.on("requestJoinRoom", ({ roomID, userData }) => {
      if (!rooms[roomID]) {
        rooms[roomID] = {
          members: [],
        };
      }

      if (rooms[roomID].members.length > 5) {
        socket.emit("room is full");

        return;
      }

      if (userData.isInterviewee) {
        rooms[roomID].interviewee = socket.id;
      }

      rooms[roomID].members.push({ ...userData, socketID: socket.id });
      users[socket.id] = userData;
      socketToRoom[socket.id] = roomID;

      socket.join(roomID);

      const targetUsers = rooms[roomID].members.filter((member) => member.socketID !== socket.id);

      socket.emit("successJoinUser", targetUsers);
    });

    socket.on("sendSignal", ({ callee, caller, signal }) => {
      io.to(callee).emit("joinNewUser", { signal, caller });
    });

    socket.on("returnSignal", ({ signal, caller }) => {
      io.to(caller).emit("receiveReturnSignal", { signal, id: socket.id });
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("userLeft");
      const roomID = socketToRoom[socket.id];

      const leftUsers = rooms[roomID]?.members.filter(
        (member) => member.socketID !== socket.id
      );

      if (leftUsers?.length !== 0) {
        if (rooms[roomID]?.members) {
          rooms[roomID].members = leftUsers;
        }
      } else {
        delete rooms[roomID];
      }

      delete users[socket.id];

      socket.emit("successToLeave");
    });
  });

  app.io = io;
};
