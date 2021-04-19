
/**
 * Module dependencies.
 */

const app = require("../app");
const debug = require("debug")("memoterview-backend:server");
const http = require("http");
const { port, socketClientURL } = require("../src/config");

/**
 * Get port from environment and store in Express.
 */

app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => console.log(`server is listening ${port}`));
server.on("error", onError);
server.on("listening", onListening);

app.io.attach(server, {
  cors: {
    origin: socketClientURL,
    credential: true,
    transports: ["websocket"],
  },
});
/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string"
    ? "Pipe " + port
    : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;
  debug("Listening on " + bind);
}
