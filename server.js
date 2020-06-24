var express = require("express");
var cors = require("cors");
var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const dotenv = require("dotenv");
dotenv.config();
var allUsers = [];
const port = process.env.PORT || 3030;

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}
app.use(express.json());
app.use(cors());

app.post("/login", (req, res) => {
  let { username, password } = req.body;
  if (
    username === process.env.APP_USERNAME &&
    password === process.env.APP_PASSWORD
  ) {
    res.send({ AUTH: true });
  } else {
    res.send({ AUTH: false });
  }
});

io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("userName", (res) => {
    let { username } = res;
    let user = {
      username,
      id: socket.id,
    };
    allUsers = [...allUsers, user];
    io.emit("allUsers", { allUsers });
    io.emit("userUpdate", { username });
    setTimeout(() => io.emit("userUpdate", undefined), 5000);
    console.log(`Total Users Connected in chat are ${allUsers.length}`);
  });
  //   return { id: socket.id };
  io.emit("allUsers", { allUsers });
  socket.on("message", (res) => {
    let messageTime = formatAMPM(new Date());
    res.timeOfMsg = messageTime;
    io.emit("newMessage", { res });
  });
  socket.on("userTyping", (res) => {
    let { username } = res;
    io.emit("userTypeUpdate", { username });
    setTimeout(() => io.emit("userTypeUpdate", undefined), 2000);
  });

  socket.on("userTypingStop", (res) => {
    io.emit("userTypeUpdate", undefined);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    allUsers = allUsers.filter((user) => user.id !== socket.id);
    io.emit("allUsers", { allUsers });
    console.log(`Total Users Connected in chat are ${allUsers.length}`);
  });
  socket.emit("connectId", { id: socket.id });
});

http.listen(port, () => {
  console.log("listening on *:3030");
});
