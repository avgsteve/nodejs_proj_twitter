const express = require('express');
const router = express.Router();
const multer = require("multer");
// 將圖片存到 root/public/image/user 資料夾
const upload = multer({ dest: "public/images/user" });
const { checkReqBodyErrors } = require('../../errorHandlers/checkReqValidationErrors');
const authController = require('../auth/authController');
const meApiControllers = require('./meApiControllers');


router.use(authController.restrictToSignedInUser);
// === 限制下列↓↓↓路徑只能讓登入的使用者使用 (logged in user only) ===

// Private route: root/api/me
// Method: GET
// Get current logged-in user data
router.get("/", meApiControllers.getCurrentLoggedInUser);


module.exports = router;