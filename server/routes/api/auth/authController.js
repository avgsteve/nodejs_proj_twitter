const bcrypt = require('bcrypt');
const User = require('./../../../database/schemas/UserSchema');
const CustomError = require('./../../errorHandlers/customError');
const jwt = require('jsonwebtoken');
const cookieHelper = require('./sendResWithToken');
const { promisify } = require("util");
require('dotenv').config();

exports.login = async (req, res) => {
  let { account, password } = req.body;

  if (!account || !password) {    
    return sendLoginError("User name or password can't be empty", req, res);
  }


  try {

    let userExisted = await User.findOne({
      $or: [
        { userName: account },
        { email: account }
      ]
    }).select('hashed_password isActivated _id');

    // 找不到帳號 (帳號不存在)
    if (!userExisted) {
      return sendLoginError(`incorrect account or password;`, req, res);
    }

    // console.log('userExisted: \n', userExisted);

    if (!userExisted.isActivated)
      return sendLoginError(`Please activate account first!`, req, res);

    if ((await userExisted.verifyPassword(password)) === true) {
      userExisted.hashed_password = '---encrypted---';
      return cookieHelper.sendResponseWithToken(userExisted, 200, req, res);
    }
    // 密碼 or 帳號錯誤
    return sendLoginError(`incorrect account or password`, req, res);

  } catch (error) {
    console.log('登入錯誤: ', error);
    return sendLoginError("error while logging in", req, res);
  }

};


const sendLoginError = (errorMessage, req, res) => {
  let error = new CustomError(errorMessage, 400, {
    errorLocation: req.originalUrl || '/login'
  });
  console.log('user登入失敗: ', error);
  return res.status(400).json(error);
};

// ========== Check if use is logged in ===========
// Will get cookie for token & query a user document then save it to res.locals.user as locals variable for .pug files
exports.checkIfUserIsLoggedIn = async (req, res, next) => {
  // console.log('checkIfUserIsLoggedIn');
  // console.log('req.cookies:', req.cookies);
  if (req.cookies && req.cookies.jwtCookie) {

    try {
      const decodedDataFromToken = await promisify(jwt.verify)(
        req.cookies.jwtCookie,
        process.env.JWT_SECRET
      );

      // console.log('decodedDataFromToken: ', decodedDataFromToken);
      const currentUser = await User.findById(decodedDataFromToken.id);


      if (!currentUser) {
        return next();
      }

      const processedUserData = currentUser.toObject();
      delete processedUserData.hashed_password;
      delete processedUserData.salt;

      res.locals.user = processedUserData;

      return next();
    } catch (error) {
      console.log('error while getting and verifying cookie', error);
      res.locals.user = "";
      return next();
    }
  }
  console.log("\njwtCookie not found in req.cookies");
  next();
};


exports.restrictToSignedInUser = async (req, res, next) => {
  // console.log('res.locals in restrictToSignedInUser: ', res.locals);

  try {

    if (res.locals.user === undefined || !res.locals.user._id === undefined) {
      let ip = (
        req.ip || // for express only
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress || "(can't get ip from current user)"
      ).split(',')[0].trim();
      console.log('unauthorized access from ip: ', ip);
      console.log('req.headers: ', req.headers);

      if (req.originalUrl.includes('api'))
        return res
          .status(401)
          .send(new CustomError("Please sign in to use this API", 401));

      return res.redirect('/');

    }

    // when all clear
    next();

  } catch (error) {
    console.log('error in restrictToSignedInUser middleware:', error);
  }

};