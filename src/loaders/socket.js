const { updateInterviewComplete } = require("../services/intervieweeService");

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
          isIntervieweeJoined: false,
        };
      }

      if (rooms[roomID]?.members.length > 5) {
        socket.emit("error", { message: "room is full" });

        return;
      }

      if (userData.isInterviewee) {
        rooms[roomID].interviewee = socket.id;
        rooms[roomID].isIntervieweeJoined = true;
      }

      rooms[roomID].members.push({ ...userData, socketID: socket.id });
      users[socket.id] = userData;
      socketToRoom[socket.id] = roomID;

      socket.join(roomID);

      const targetUsers = rooms[roomID].members.filter(
        (member) => member.socketID !== socket.id
      );

      socket.emit("joinSuccess", targetUsers);

      if (rooms[roomID].isIntervieweeJoined) {
        userData.isInterviewee ? socket.broadcast.emit("enableButton") : socket.emit("enableButton");
      }
    });

    socket.on("sendSignal", ({ callee, caller, signal }) => {
      io.to(callee).emit("joinNewUser", { signal, caller });
    });

    socket.on("returnSignal", ({ signal, caller }) => {
      io.to(caller).emit("receiveReturnSignal", { signal, id: socket.id });
    });

    socket.on("disconnect", ({ interviewDuration }) => {
      const roomID = socketToRoom[socket.id];
      const leftUsers = rooms[roomID]?.members.filter(
        (member) => member.socketID !== socket.id
      );

      const leftInterviewers = leftUsers ? leftUsers.filter((member) => !member.isInterviewee) : [];

      if (leftInterviewers?.length === 0) {
        updateInterviewComplete({ intervieweeId: roomID, interviewDuration });
      }

      if (leftUsers?.length !== 0) {
        if (rooms[roomID]) {
          rooms[roomID].members = leftUsers;
        }
      } else {
        delete rooms[roomID];
      }

      delete users[socket.id];

      delete socketToRoom[socket.id];

      socket.to(roomID).emit("successToLeaveOtherUser", { id: socket.id });
    });

    socket.on("startInterview", () => {
      const roomID = socketToRoom[socket.id];

      io.in(roomID).emit("startInterview");
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

      io.in(roomID).emit("startQuestion");
    });

    socket.on("endQuestion", () => {
      const roomID = socketToRoom[socket.id];

      if (
        !checkRoomExists(roomID, socket) ||
        !checkIntervieweeExists(roomID, socket)
      ) {
        return;
      }

      io.in(roomID).emit("endQuestion");
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
      io.in(roomID).emit("startAnswer");
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
      io.in(roomID).emit("endAnswer");
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
      io.in(roomID).emit("uploadComplete");
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
