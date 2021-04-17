// const loginRouter = require("./auth/login");
const apiRouter = require("./api");

module.exports = app => {
  app.use("/", apiRouter);
};
