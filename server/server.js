require('dotenv').config();
require("./database/connectionToMongoDB.js");//
const app = require('./app.js');
const port = process.env.PORT || process.env.SERVER_PORT_DEV || 3003; // process.env.PORT for heroku
const chalk = require('chalk');

require('./scheduledJobs/cronJobs')();


console.log(
  'current server environment: ',
  chalk.yellow(`${process.env.NODE_ENV}`)
);


const server = app.listen(
  port, () => {
    console.log(
      "Server listening on port: " + chalk.yellow(`${port}`)
    );
  }
);


const io = require("socket.io")(server, { pingTimeout: 60000 });

const socketModule = require('./socket.io/socketEventController');
exports.io = io;

io.on("connection", socketModule.module.socketEvents);

/*
original code socket.io block:

    io.on("connection", clientSocket => {
      ... (function 內容)
    });

moved to socketEventControl.js as module
*/

