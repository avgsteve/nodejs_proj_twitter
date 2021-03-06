const express = require('express');
const router = express.Router();
const multer = require("multer");
// 將圖片存到 root/public/image/user 資料夾
const upload = multer({ dest: "public/images/user" });
const { checkReqBodyErrors } = require('../../errorHandlers/checkReqValidationErrors');
const userApiController = require('./userApiControllers');
const authController = require('./../auth/authController')


router.use(authController.restrictToSignedInUser);
// === 限制下列↓↓↓路徑只能讓登入的使用者使用 (logged in user only) ===

// Private route: root/api/users/all
// Method: GET
// Get all users data (super-admin only)
router.get("/"
    , userApiController.getUsersByQuery);

// Private route: root/api/users/all
// Method: GET
// Get all users data (super-admin only)
router.get("/all",
    function (req, res, next) {
        if (res.locals.user.role !== 'super-admin')
            return res.status(400).send("only super admin can get all user's data");
        next();
    }
    , userApiController.getUsersByQuery);

// Private route: root/api/users/:userId/
// Method: DELETE
// 取得登入使用者資料
router.delete("/:userIdToDelete", userApiController.deleteUser);

// 追蹤使用者 (put更新document)
// Method: PUT
// Private route: root/api/:userId/follow
router.put("/:userIdToFollow/follow", userApiController.followUser);

// populate 使用者追蹤的使用者清單 (顯示使用者追蹤了哪些人)
// Method: GET
// Private route: root/api/:userId/following
router.get("/:userId/following", userApiController.getFollowingUsers);

// populate 追蹤使用者的使用者清單 (顯示那些人追蹤了哪些人)
// Method: GET
// Private route: root/api/:userId/followers
router.get("/:userId/followers", userApiController.getFollowersUsers);

// 上傳頭像
// Method: POST
// Private route: root/api/:userId/followers
router.post("/profilePicture",
    upload.single("croppedImage"),
    userApiController.uploadProfilePhoto);

// 上傳個人頁面背景
// Method: POST
// Private route: root/api/:userId/coverPhoto
router.post("/coverPhoto",
    upload.single("croppedImage"),
    userApiController.uploadCoverPhoto);

module.exports = router;