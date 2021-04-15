const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_DB_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
  dbName: "memoterview",
});

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("db connection error", error);
});

db.once("open", () => {
  console.log("Connected!");
});

module.exports = db;
