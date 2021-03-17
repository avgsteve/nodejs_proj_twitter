const express = require('express');
const router = express.Router();
const User = require('../../../database/schemas/UserSchema');
const profilePageController = require('./profilePageController');
router.use((req, res, next) => {
    if (!res.locals.user) return res.redirect('/login');
    next();
});

// path: root/profile/
router.get("/",
    profilePageController.getUserPage);

router.get("/:userName",
    profilePageController.getUserPageById);

router.get("/:userName/replies",
    profilePageController.getUserPageById_withReplies);

router.get("/:userName/following",
    profilePageController.getFollowingUsersPage);

router.get("/:userName/followers", profilePageController.getFollowersPage);


module.exports = router;