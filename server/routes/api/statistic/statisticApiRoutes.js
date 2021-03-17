const express = require('express');
const router = express.Router();
const controller = require('./statisticApiController');



router.get("/posts/likes", controller.getSumOfLikes);
router.get("/posts/created", controller.getSumOfCreatedPost);


module.exports = router;