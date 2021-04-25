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
        socket.emit("error", { message: "room is full" });

        return;
      }

      if (userData.isInterviewee) {
        rooms[roomID].interviewee = socket.id;
      }

      rooms[roomID].members.push({ ...userData, socketID: socket.id });

      console.log(rooms[roomID].members, socket.id);
      users[socket.id] = userData;
      socketToRoom[socket.id] = roomID;

      socket.join(roomID);

      const targetUsers = rooms[roomID].members.filter(
        (member) => member.socketID !== socket.id
      );

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
        if (rooms[roomID]) {
          rooms[roomID].members = leftUsers;
        }
      } else {
        delete rooms[roomID];
      }

      delete users[socket.id];

      delete socketToRoom[socket.id];
      console.log("deleted", socket.id);
      socket.emit("successToLeave");
    });

    socket.on("startInterview", () => {
      socket.broadcast.emit("startInterview");
    });

    // audio record socket logics
    socket.on("question", ({ userId }) => {
      const roomID = socketToRoom[socket.id];

      if (
        !checkRoomExists(roomID, socket) ||
        !checkIntervieweeExists(roomID, socket)
      ) {
        return;
      }

      const intervieweeSocketId = rooms[roomID].interviewee;
      const mySocketId = socket.id;

      rooms[roomID].questioner = {
        questionerSocketId: socket.id,
        questionerId: userId,
      };

      const otherInterviewers = rooms[roomID].members.filter(
        (member) =>
          member.socketID !== mySocketId &&
          member.socketID !== intervieweeSocketId
      );

      for (const otherInterviewer of otherInterviewers) {
        io.to(otherInterviewer.socketID).emit("preventButton");
      }
    });

    socket.on("requestAnswer", () => {
      const roomID = socketToRoom[socket.id];

      if (
        !checkRoomExists(roomID, socket) ||
        !checkIntervieweeExists(roomID, socket)
      ) {
        return;
      }

      const intervieweeSocketId = rooms[roomID].interviewee;

      io.to(intervieweeSocketId).emit("intervieweeStartAnswer");
    });

    socket.on("endAnswer", () => {
      const roomID = socketToRoom[socket.id];

      if (
        !checkRoomExists(roomID, socket) ||
        !checkIntervieweeExists(roomID, socket)
      ) {
        return;
      }

      const intervieweeSocketId = rooms[roomID].interviewee;

      io.to(intervieweeSocketId).emit("intervieweeEndAnswer");
    });

    socket.on("sendAnswer", ({ answer }) => {
      const roomID = socketToRoom[socket.id];

      if (
        !checkRoomExists(roomID, socket) ||
        !checkIntervieweeExists(roomID, socket) ||
        !checkQuestionerExists(roomID, socket)
      ) {
        return;
      }

      const { questionerSocketId, questionerId } = rooms[roomID].questioner;

      io.to(questionerSocketId).emit("questionerReceiveAnswer", {
        questionerId,
        answer,
      });
    });

    socket.on("uploadComplete", () => {
      const roomID = socketToRoom[socket.id];

      if (
        !checkRoomExists(roomID, socket) ||
        !checkIntervieweeExists(roomID, socket)
      ) {
        return;
      }

      const intervieweeSocketId = rooms[roomID].interviewee;
      const mySocketId = socket.id;

      const otherInterviewers = rooms[roomID].members.filter(
        (member) =>
          member.socketID !== mySocketId &&
          member.socketID !== intervieweeSocketId
      );

      for (const otherInterviewer of otherInterviewers) {
        io.to(otherInterviewer.socketID).emit("enableButton");
      }
    });
  });

  function checkRoomExists(roomID, socket) {
    if (!rooms[roomID]) {
      io.to(socket.id).emit("error", { message: "room is not exist" });
      return false;
    }

    return true;
  }

  function checkIntervieweeExists(roomID, socket) {
    if (!rooms[roomID].interviewee) {
      io.to(socket.id).emit("error", { message: "interviewee is not exist" });
      return false;
    }

    return true;
  }

  function checkQuestionerExists(roomID, socket) {
    if (!rooms[roomID].questioner) {
      io.to(socket.id).emit("error", { message: "questioner is not exist" });
      return false;
    }

    return true;
  }

  app.io = io;
};
