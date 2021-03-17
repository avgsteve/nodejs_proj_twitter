const express = require('express');
const router = express.Router();
const MessageController = require('./messagesApiControllers');

// path: POST@root/api/message/
// function: Use chat id to create a new message in chat
router.post("/", MessageController.createNewChatMessage);

module.exports = router;