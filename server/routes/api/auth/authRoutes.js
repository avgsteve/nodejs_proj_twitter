const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { checkReqBodyErrors } = require('./../../errorHandlers/checkReqValidationErrors');
const userApiController = require('./../users/userApiControllers');
const authController = require('./authController');


// Login 登入
router.post("/login",
  [
    body('account').notEmpty().trim()
      .withMessage('user name or email for login is required'),
    body('password').trim().isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters')
  ],
  checkReqBodyErrors,
  authController.login
);

router.post("/register",
  [
    body('firstName').notEmpty().trim().withMessage('first name is required'),
    body('lastName').notEmpty().trim().withMessage('last name is required'),
    body('userName').notEmpty().trim().withMessage('user name is required'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters')
  ],
  checkReqBodyErrors,
  userApiController.register
);

router.post("/logout", (req, res, next) => {

  if (res.locals.user) res.locals.user = null;

  if (req.session) {
    req.session.destroy(() => {
      // res.redirect("/login");
    });
  }

  res.cookie("jwtCookie", "loggedOut", {
    expires: new Date(Date.now() + 1),
    httpOnly: true,
  });

  //
  res.status(200).json({
    status: "success",
    responseMessage: "Cookie for logging out user has been sent!",
  });
});

module.exports = router;