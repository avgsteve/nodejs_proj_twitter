"use strict";

var express = require('express');

var app = express();

var cookieParser = require('cookie-parser');

var path = require('path');

var bodyParser = require("body-parser");

var session = require("express-session"); // const morgan = require('morgan');
// ↓↓ Add this for using PM2 on ubuntu
// ref: https://tinyurl.com/usePM2WithBuntu


require('dotenv').config({
  path: path.join(__dirname, '.env')
}); // const io = require("socket.io")(server, { pingTimeout: 60000 });


app.set("view engine", "pug");
app.set("views", "views");
app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(cookieParser()); // will display req.cookie in test middle ware

app.use(bodyParser.urlencoded({
  extended: true
})); // let publicFolderPath = path.join(__dirname, "./../public");
// console.log({ publicFolderPath });

app.use(express["static"](path.join(__dirname, "./../public")));
app.use(session({
  secret: "bbq chips",
  resave: true,
  saveUninitialized: false
})); // app.use(
//     morgan(
//         // 'dev'
//         'tiny'
//     )
// );

app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
})); // app.use(
//     require('./appMiddlewares') // Todo: all middlewares go here
// );
// ==== ↓↓↓ Routes for front-end pages: ↓↓↓ ====
//  # Public Routes for front-end pages don't need to check user identity
// include /login , /register and /login

app.use("/", require('./routes/frontendPages/auth/authPagesRoutes'));
app.use("/", require('./routes/api/auth/authRoutes'));
app.get("/time", function (req, res) {
  res.send({
    epoch: Date.now(),
    utc: new Date(Date.now()).toISOString()
  });
}); //   # Private Routes for front-end pages need to check user identity

var authController = require('./routes/api/auth/authController');

app.use(authController.checkIfUserIsLoggedIn);
var pagePath = "./routes/frontendPages";
app.use("/posts", require("".concat(pagePath, "/post/postPageRoutes")));
app.use("/profile", require("".concat(pagePath, "/profile/profilePageRoutes")));
app.use("/photo", require("".concat(pagePath, "/photo/photoPageRoutes")));
app.use("/uploads", require("".concat(pagePath, "/upload/uploadPageRoutes")));
app.use("/search", require("".concat(pagePath, "/search/searchPageRoutes")));
app.use("/messages", require("".concat(pagePath, "/message/messagesPageRoutes")));
app.use("/notifications", require("".concat(pagePath, "/notification/notificationPageRoutes")));
app.use("/me", require("".concat(pagePath, "/me/mePageRoutes"))); // ==== ↓↓↓ Backend/Api routes ↓↓↓ ====

var apiPath = "./routes/api";
app.use("/api/posts", require("".concat(apiPath, "/posts/postsApiRoutes")));
app.use("/api/users", require("".concat(apiPath, "/users/userApiRoutes")));
app.use("/api/statistic", require("".concat(apiPath, "/statistic/statisticApiRoutes"))); // ==== ↓↓↓ Protected Api routes: ↓↓↓ ====

app.use("/api/me", authController.restrictToSignedInUser, require("".concat(apiPath, "/me/meApiRoutes")));
app.use("/api/chats", authController.restrictToSignedInUser, require("".concat(apiPath, "/chats/chatsApiRoutes")));
app.use("/api/messages", authController.restrictToSignedInUser, require("".concat(apiPath, "/messages/messagesApiRoutes")));
app.use("/api/notifications", authController.restrictToSignedInUser, require("".concat(apiPath, "/notifications/notificationsApiRoutes"))); // ==== ↓↓↓ Front End Root Path: ↓↓↓ ====

var rootPageRoute = require('./routes/frontendPages/root/rootPageController');

app.use("/", rootPageRoute.rootPage); // ==== ↓↓↓ Exception Root Path ↓↓↓ ====
// (all the other paths are not controlled or managed yet)

app.all('*', require('./routes/errorHandlers/routeNotFoundHandler'));
module.exports = app;