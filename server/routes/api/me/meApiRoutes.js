const express = require('express');
const router = express.Router();
const multer = require("multer");
// 將圖片存到 root/public/image/user 資料夾
const upload = multer({ dest: "public/images/user" });
const { checkReqBodyErrors } = require('../../errorHandlers/checkReqValidationErrors');
const { body } = require('express-validator');
const authController = require('../auth/authController');
const meApiControllers = require('./meApiControllers');
const userApiController = require('./../users/userApiControllers')


router.use(authController.restrictToSignedInUser);
// === 限制下列↓↓↓路徑只能讓登入的使用者使用 (logged in user only) ===

// Private route: root/api/me
// Method: GET
// Get current logged-in user data
router.get("/", meApiControllers.getCurrentLoggedInUser);

// Private route: root/api/me/updatePassword
// Method: GET
// Get current logged-in user data

router.put("/updatePassword",
  [
    body('newPassword').notEmpty().trim()
      .withMessage('new password and confirm password are required'),
    body('confirmPassword').notEmpty().trim()
      .withMessage('new password and confirm password are required'),
    body('newPassword').trim().isLength({ min: 5, max: 20 })
      .withMessage('new password must be between 5 to 20 characters long'),
    body('confirmPassword').trim().isLength({ min: 5, max: 20 })
      .withMessage('confirm password must be between 5 to 20 characters long')
  ],
  checkReqBodyErrors,
  userApiController.changePassword
);

router.post("/:userIdToDelete/delete", userApiController.deleteUser);
router.post("/:userIdToDelete/delete/cancel", userApiController.cancelDeleteUser);

module.exports = router;