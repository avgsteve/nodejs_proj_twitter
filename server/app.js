const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

const path = require('path');
const bodyParser = require("body-parser");
const session = require("express-session");
const morgan = require('morgan');

// ↓↓ Add this for using PM2 on ubuntu
// ref: https://tinyurl.com/usePM2WithBuntu
require('dotenv').config({
    path: path.join(__dirname, '.env')
});


// const io = require("socket.io")(server, { pingTimeout: 60000 });

app.set("view engine", "pug");
app.set("views", "views");
app.set('trust proxy', true);

app.use(bodyParser.json());
app.use(cookieParser()); // will display req.cookie in test middle ware
app.use(bodyParser.urlencoded({
    extended: true
}));

let publicFolderPath = path.join(__dirname, "./../public");

// console.log({ publicFolderPath });

app.use(express.static(path.join(__dirname, "./../public")));

app.use(session({
    secret: "bbq chips",
    resave: true,
    saveUninitialized: false,

}));

// app.use(
//     morgan(
//         // 'dev'
//         'tiny'
//     )
// );

app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}));


// app.use(
//     require('./appMiddlewares') // Todo: all middlewares go here
// );

// ==== ↓↓↓ Routes for front-end pages: ↓↓↓ ====
//  # Public Routes for front-end pages don't need to check user identity
// include /login , /register and /login
app.use("/", require('./routes/frontendPages/auth/authPagesRoutes'));
app.use("/", require('./routes/api/auth/authRoutes'));

//   # Private Routes for front-end pages need to check user identity
const authController = require('./routes/api/auth/authController');
app.use(authController.checkIfUserIsLoggedIn);

const pagePath = "./routes/frontendPages";
app.use("/posts", require(`${pagePath}/post/postPageRoutes`));
app.use("/profile", require(`${pagePath}/profile/profilePageRoutes`));
app.use("/uploads", require(`${pagePath}/upload/uploadPageRoutes`));
app.use("/search", require(`${pagePath}/search/searchPageRoutes`));
app.use("/messages", require(`${pagePath}/message/messagesPageRoutes`));
app.use("/notifications", require(`${pagePath}/notification/notificationPageRoutes`));


// ==== ↓↓↓ Backend/Api routes ↓↓↓ ====
const apiPath = "./routes/api";
app.use("/api/posts", require(`${apiPath}/posts/postsApiRoutes`));
app.use("/api/users", require(`${apiPath}/users/userApiRoutes`));

app.use("/api/statistic",
    require(`${apiPath}/statistic/statisticApiRoutes`));

// ==== ↓↓↓ Protected Api routes: ↓↓↓ ====
app.use("/api/chats",
    authController.restrictToSignedInUser,
    require(`${apiPath}/chats/chatsApiRoutes`));

app.use("/api/messages",
    authController.restrictToSignedInUser,
    require(`${apiPath}/messages/messagesApiRoutes`));

app.use("/api/notifications",
    authController.restrictToSignedInUser,
    require(`${apiPath}/notifications/notificationsApiRoutes`));

// ==== ↓↓↓ Front End Root Path: ↓↓↓ ====
const rootPageRoute = require('./routes/frontendPages/root/rootPageController');
app.use("/", rootPageRoute.rootPage);

// ==== ↓↓↓ Exception Root Path ↓↓↓ ====
// (all the other paths are not controlled or managed yet)
app.all('*', require('./routes/errorHandlers/routeNotFoundHandler'));

module.exports = app;