const jwt = require("jsonwebtoken");
const CustomError = require('./../../errorHandlers/customError');
require('dotenv').config();

const signToken = (document_id) => {
  // jwt.sign(payload, secretOrPrivateKey, [options, callback])
  return jwt.sign(
    {
      // 1) first argument : payload:
      id: document_id, // this is MongoDB's document _id
    },
    // 2) second argument : secretOrPrivateKey
    process.env.JWT_SECRET,
    // fast way to generate quick and easy way to generate JWT secret. In terminal: node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
    // ref:  https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/learn/lecture/15065292#questions/8159650

    {
      // 3) third argument: expiry time (current setting: 90days)
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

// Sign a token, set cookie and send HTTP response for processed user document
exports.sendResponseWithToken = (user, statusCode, req, res) => {
  const tokenAsPayload = signToken(user._id);

  res.cookie(
    // ref: http://expressjs.com/en/5x/api.html#res.cookie
    "jwtCookie", // cookie name
    tokenAsPayload, // cookie payload
    {
      // options
      expires: new Date(
        // Option: expires . Set expiry date of the cookie in GMT. If not specified or set to 0, creates a session cookie.
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 24 * 10 // default is one second and turn it to 10 days
      ),
      httpOnly: true,
      sameSite: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    }
  );


  res.status(statusCode).send(user);
};



