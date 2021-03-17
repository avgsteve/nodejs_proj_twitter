const express = require('express');
const router = express.Router();
const apiController = require('./chatsApiControllers');


// path: POST@root/api/chats  
// query: ? unreadOnly = true  getUnreadCounts = true
// function: Create a new chat
router.post("/", apiController.createChat);

// path: GET@root/api/chats ?
// function: get all chats created for chat list page
router.get("/", apiController.getAllChatsForCurrentUser);

// path: GET@root/api/chats/:chatId
// function: get a single chat document
router.get("/:chatId", apiController.getChatWithId);

// path: PUT@root/api/chats/:chatId
// function: update a single chat document
router.put("/:chatId", apiController.updateChatWithId);

// path: GET@root/api/chats/:chatId/title
// function: get title of a single chat document
router.get("/:chatId/title", apiController.getTitleOfOneChatWithId);

// path: GET@root/api/chats/:chatId/messages
// function: get all chat messages
router.get("/:chatId/messages", apiController.getAllMessageFromOneChat);

// path: PUT@root/api/chats/:chatId/messages/markAsRead
// function: get a chat by id and make all its message opened
router.put("/:chatId/messages/markAsRead", apiController.markMessageAsReadFromOneChat);

module.exports = router;