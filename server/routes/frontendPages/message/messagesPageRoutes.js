const express = require('express');
const router = express.Router();
const pageController = require('./messagesPageController')

router.use((req, res, next) => {
    if (!res.locals.user) return res.redirect('/login');
    next();
});

// path: GET@root/messages/
router.get("/", pageController.redirectToListPage);

// path: GET@root/messages/list
router.get("/list", pageController.chatRoomListPage);

// path: GET@root/messages/new 建立新對話群組
router.get("/new", pageController.createChatPage);

// path: GET@root/messages/chatRoom/:chatId
router.get("/chatRoom/:chatId", pageController.chatRoomPage);

// path: GET@root/messages/* 其餘的路徑都會被轉到  messages/list
router.get("/*", pageController.redirectToListPage);

module.exports = router;