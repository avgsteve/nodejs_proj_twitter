const User = require("../../../database/schemas/UserSchema");
const catchAsync = require('../../utils/catchAsync');
const jwt = require("jsonwebtoken");
const CustomError = require('../../errorHandlers/customError');
const { promisify } = require("util");
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
const send200ResponseWithToken = (user, statusCode, req, res) => {
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


  res.status(statusCode).json({
    status: "success",
    token: tokenAsPayload,
    data: {
      user: user,
    },
  });
};

// ========== SIGN UP ===========
// exports.signup = async (req, res, next) => {
//   // prevent maliciou sign up
//   if (req.body.role) {
//     const error = new CustomError(
//       "Illigal attempt to register with 'role' property. Access denied.",
//       400
//     );

//     res.status(400).json(error);

//     return console.log(
//       "\nIlligal attempt to register as admin. Access denied.\n",
//       "Register content: \n",
//       req.body
//     );
//   }

//   if (req.body.password !== req.body.passwordConfirm) {
//     return res
//       .status(400)
//       .json(
//         new CustomError("password and confirming-password are not matched", 400)
//       );
//   }

//   if (!req.body.name) {
//     return res
//       .status(400)
//       .json(new CustomError("The name fields is empty, please check", 400));
//   }

//   if (!req.body.email) {
//     return res
//       .status(400)
//       .json(new CustomError("The email fields is empty, please check", 400));
//   }

//   const activationCode = crypto.randomBytes(32).toString("hex");

//   console.log("\nactivationCode for newly registered user is:", activationCode);

//   newUser = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     activation_code: activationCode,

//     // passwordConfirm: req.body.passwordConfirm,
//   })
//     .then(async (newUser) => {
//       console.log(
//         "\n=== new user document has been create: ===\n",
//         newUser,
//         "\n\n"
//       );

//       const httpProtocol =
//         process.env.NODE_ENV.toString().trim() === "development"
//           ? "http"
//           : "https";

//       const activationURL = `${httpProtocol}://${req.get(
//         "host"
//       )}/activate_account/${activationCode}`;

//       // console.log(`\n#URL for reset token:`, resetURL);

//       //  EmailWithNodeMailer constructor(userData, url_EmbbedInEmail)
//       await new EmailWithNodeMailer(newUser, activationURL)
//         .sendAccountActivation()
//         .then((result) => {
//           // res.status(200).json({
//           //   status: 'success',
//           //   message: 'Token sent to email!',
//           // });

//           res.status(200).json({
//             status: "success",
//             message: "Sign up successful. Please activate the account.",
//             data: {
//               user: newUser,
//             },
//           });
//         })
//         .catch(async (error) => {
//           console.log(
//             "Error while send account activation code to user",
//             error
//           );

//           await User.findByIdAndDelete(newUser._id).then((result) => {
//             console.log("user has been deleted");
//           });
//         });
//     })
//     .catch((error) => {
//       console.log("error!!: \n", error);

//       if (error.code === 11000)
//         error = "This email has been already registered";

//       res.status(400).json({
//         statusCode: 400,
//         status: "fail",
//         isOperational: true,
//         error_message: error,
//       });
//     });
// };

// // ========== ACTIVATE Account after user signed up ===========
// exports.activateAccount = catchAsync(async (req, res, next) => {
//   let activationCode = req.body.account_activation_code.toString();

//   // check activationCode if it's valid format
//   if (!activationCode || activationCode.length < 64) {
//     const error = new CustomError("Please include valid activation token.", 400);
//     return res.status(400).json(error);
//   }

//   // after then use hashed activation code to find user's document that is not activated yet
//   const hashedActivationCode = crypto
//     .createHmac("sha256", process.env.SALT_FOR_HMAC)
//     .update(activationCode)
//     .digest("hex");
//   console.log("\nactivationCode for newly registered user is:", activationCode);

//   await User.findOne({
//     "account_activation.hashedActivationCode": hashedActivationCode,
//     "account_activation.activationCodeSentAt": {
//       $gt: Date.now() - 1000 * 60 * 60, // this makes activation code valid for 1 hour
//     },
//   }).then((user) => {
//     if (!user) {
//       error = new CustomError(
//         "Sorry. Your activation code has expired. Please request new code",
//         401
//       );
//       return res.status(401).render("./error_pages/page_401_unauthorized", {
//         title: "Unauthourized",
//         error_message: error.error_message,
//         user_data: res.locals.user,
//       });
//     }

//     // If user document can be found with valid code, update the account_activation's sub fields
//     user.account_activation.isActivated = true;
//     user.account_activation.hashedActivationCode = "";
//     user.account_activation.activationCodeSentAt = null;
//     user.save().then((result) => {
//       createSendToken(result, 200, req, res);
//     });
//   });
// });

// // ========== Resend mail for activation code ===========
// exports.requestActivateCode = catchAsync(async (req, res) => {
//   if (!req.body.email) {
//     return res
//       .status(400)
//       .json(new CustomError("The email fields is empty, please check", 400));
//   }

//   await User.findOne({
//     email: req.body.email,
//   })
//     .then(async (user) => {
//       // console.log('\nuser data in requestActivateCode:\n', user)

//       if (user.account_activation.isActivated)
//         return res
//           .status(400)
//           .json(
//             new CustomError(
//               "User's account has been activated, No need to request new activation code",
//               400
//             )
//           );

//       const codeLastSentAt = user.account_activation.activationCodeSentAt;

//       // if code has been sent more than 5 minutes ago, make it unusable
//       if (codeLastSentAt > Date.now() - 1000 * 60 * 5) {
//         let timeLeftBeforeResend =
//           +new Date(codeLastSentAt) + 1000 * 60 * 5 - +Date.now();
//         let timeLeftBeforeResend_minutes;

//         console.log("timeLeftBeforeResend: ", timeLeftBeforeResend);

//         function convertMillisToMinutes(millis) {
//           let minutes = Math.floor(millis / 60000);
//           let seconds = ((millis % 60000) / 1000).toFixed(0);
//           return `${minutes} minutes and ${seconds} seconds`;
//         }

//         timeLeftBeforeResend_minutes = convertMillisToMinutes(
//           timeLeftBeforeResend
//         );

//         console.log(
//           "timeLeftBeforeResend_minutes: ",
//           timeLeftBeforeResend_minutes
//         );

//         return res
//           .status(400)
//           .json(
//             new CustomError(
//               `User can only request new code for every 5 minutes. Need to wait for ${timeLeftBeforeResend_minutes} before making new request `,
//               400
//             )
//           );
//       }

//       const activationCode = crypto.randomBytes(32).toString("hex");

//       // update user's document
//       user.account_activation.activationCodeSent_count =
//         user.account_activation.activationCodeSent_count + 1;
//       user.activation_code = activationCode;

//       user.save().then((userData) => {
//         const httpProtocol =
//           process.env.NODE_ENV.toString().trim() === "development"
//             ? "http"
//             : "https";

//         // send code with mail
//         const activationURL = `${httpProtocol}://${req.get(
//           "host"
//         )}/activate_account/${activationCode}`;

//         new EmailWithNodeMailer(userData, activationURL)
//           .sendAccountActivation()
//           .then((result) => {
//             res.status(200).json({
//               status: "success",
//               message: "Activation code has been sent to user's email.",
//             });
//           });
//       });
//     })
//     .catch((error) => {
//       console.log(
//         "Error while send new account activation code to user",
//         error
//       );

//       return res.status(400).json({
//         statusCode: 400,
//         status: "fail",
//         isOperational: true,
//         error_message:
//           "Request for sending new activation code has failed (code 433). Please try again later",
//       });
//     });
// });

exports.login = catchAsync(async (req, res, next) => {
  //deconstruct key's value and save to variable
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    next(new CustomError("Please provide email and password!", 400));
  }

  // Check of user exists && password is correct
  await User.findOne({
    email,
  }).then((user) => {
    let error;

    if (!user || !user.verifyPassword(password)) {
      //
      console.log(`\nMessage from authController: \n`);
      console.log("\x1b[31m", "User log-in has failed!\n" + "\u001b[0m");

      error = new CustomError("Incorrect email or password", 401);

      res.status(401).json(error);

      return next(error);
    }

    // if LOG IN IS SUCCESSFUL
    console.log(`\nMessage from authController: `);
    console.log("\u001b[32m", "User log-in is successful!" + "\u001b[0m");
    console.log(
      "User: " +
      "\x1b[35m" +
      user.name +
      "\u001b[0m" +
      " has successful logged in!\n"
    );

    createSendToken(user, 200, req, res);
  });
});

// ========== LOG OUT ===========
// By sending the token expires immediately in a very short period of time
exports.logout = catchAsync(async (req, res, next) => {
  // The cookie "loggedOut" will trigger the false value returned from function "isLoggedIn".
  // Also, this cookie won't appear in browser anymore next time the page is reloaded
  //  as the cookie has expired in 0.5 second
  res.cookie("jwtCookie", "loggedOut", {
    expires: new Date(Date.now() + 100),
    httpOnly: true,
  });

  //
  res.status(200).json({
    status: "success",
    responseMessage: "Cookie for logging out user has been sent!",
  });
});

//  PROTECTTION for routes from accessing with tampered or invalid token ===========
exports.protect = catchAsync(async (req, res, next) => {

  let tokenFromHeader, error;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    tokenFromHeader = req.headers.authorization.split(" ")[1];
  }
  else if (req.cookies.jwtCookie) {
    tokenFromHeader = req.cookies.jwtCookie;
  }


  if (!tokenFromHeader) {
    error = new CustomError(
      `You are not logged in! Please log in to get access`,
      401
    );
    console.log(JSON.stringify(error));

    return res.status(401).render("./error_pages/page_401_unauthorized", {
      title: "Unauthourized",
      user_data: res.locals.user,
      error_message: error.error_message,
    });
  }

  const decodedDataFromToken = await promisify(jwt.verify)(
    tokenFromHeader,
    process.env.JWT_SECRET
  );

  // Check if user still exists (in case the user is deleted after token is created)
  const freshUser = await User.findById(decodedDataFromToken.id); //

  if (!freshUser) {
    error = new CustomError(
      "The user belonging to this token doesn't exist. Please login again.",
      401
    );

    return res.status(401).render("./error_pages/page_401_unauthorized", {
      title: "Unauthourized",
      user_data: res.locals.user,
      error_message: error.error_message,
    });
  }

  // // if passwordChangedAfterTokenIAT() returns true
  // if (freshUser.passwordChangedAfterTokenIAT(decodedDataFromToken.iat)) {
  //   error = new CustomError(
  //     "User recently changed password! Please log in again!",
  //     401
  //   );
  //   // return res.status(401).json(error);

  //   return res.status(401).render("./error_pages/page_401_unauthorized", {
  //     title: "Unauthourized",
  //     error_message: error.error_message,
  //   });
  // }

  // // if passwordChangedAfterTokenIAT() returns true
  // if (freshUser.account_activation.isActivated === false) {
  //   error = new CustomError("Account is not activated!", 401);
  //   // return res.status(401).json(error);

  //   return res.status(401).render("./error_pages/page_401_acc_not_activated", {
  //     title: "Unauthourized",
  //     error_message: error.error_message,
  //   });
  // }

  // *** if all above 4 test are passed, then the login process is cleared to move on to next function middleware

  // console.log('\nLog-In process cleared! Move on to next route middleware:\n');

  // remove sensitive data from user document
  const freshUser_doc_Obj = freshUser.toObject();

  delete freshUser_doc_Obj.salt;
  delete freshUser_doc_Obj.hashed_password;

  // console.log('The user object after protect route: \n', freshUser_doc_Obj);

  req.user = freshUser_doc_Obj;
  req.user.id = freshUser_doc_Obj._id;

  // assign to fresh user data to req.user property and make it used by next middleware function

  res.locals.user = freshUser_doc_Obj;

  next();
});



exports.restrictToSignedInUser = catchAsync(async (req, res, next) => {
  // console.log('res.locals in restrictToSignedInUser: ', res.locals);

  if (res.locals.user === undefined || !res.locals.user._id === undefined) {
    let ip = (
      req.ip || // for express only
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress || "(can't get ip from current user)"
    ).split(',')[0].trim();
    console.log('unauthorized access from ip: ', ip);
    console.log('req.headers: ', req.headers);
    return res
      .status(401)
      .send(new CustomError("Please sign in to use this API", 401));
  }
  next();
});

// verify user's role based on his role property
// In authController.js,  delete(authController.protect, authController.restrictTo('admin', 'lead-guide'),
exports.restrictTo = (...roles) => {
  //the passed in ...roles will be array containing ['admin', 'lead-guide']

  return (req, res, next) => {
    // roles ['admin', 'lead-guide'] role =  'user'

    // console.log('\n=== The req obj in authController.restrictTo:\n');
    // console.log(req);

    // if the passed-in roles array does not include any .role property
    if (!roles.includes(req.user.role)) {
      // return next(new CustomError('You do not have permission to perform this action', 403 // forbidden
      // ));

      const error = new CustomError(
        "You do not have permission to perform this action",
        403
      );

      return res.status(403).render("./error_pages/page_403_forbidden", {
        title: "Forbidden",
        error_message: error.error_message,
        user_data: res.locals.user,
      });
    }

    next();
  };
};

// ========== GENERATE TOKEN WHEN FORGETTING PASSWORD AND SEND IT VIA MAIL ===========
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) When forget password, use registered email to get user based on POSTed email
  const user = await User.findOne({
    email: req.body.email,
  });
  // 1-1) if there's no result matched with query, then return an error
  if (!user) {
    // return next(new CustomError('There is no user with this email address.', 404));

    return res
      .status(404)
      .json(new CustomError("There is no user with this email address.", 404));
  }

  // 2)  Generate the random reset token valid for 10 more minutes
  const resetToken = user.generatePasswordResetToken();
  // await user.save({ validateBeforeSave: false });  (will save the property to database later)

  // 3) Send URL with reset token suffix to user's email //req.protocol is current http or https protocol
  try {
    const httpProtocol =
      process.env.NODE_ENV.toString().trim() === "development"
        ? "http"
        : "https";

    const resetURL = `${httpProtocol}://${req.headers.host}/reset_password/${resetToken}`;

    await new EmailWithNodeMailer(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    console.log("\n\nerror log in send email:\n");
    console.log(error);
    // if there's error returned from sendEmail function, then set current user's password-reset related property to undefined (clear out the generated token in case being abused or stolen)
    user.hashed_passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return res
      .status(500)
      .json(
        new CustomError(
          "There was an error sending the email. Try again later",
          500
        )
      );
  }

  // save all new value created by the this middlware function and User' model prototype function such as userSchema.methods.generatePasswordResetToken in userModel.js
  await user.save({
    validateBeforeSave: false,
  });

  //the new value in related document fields in database after calling .save function will be like:
  /*
    passwordResetExpires:  2020-06-12T06:28:56.118+00:00,
    hashed_passwordResetToken:  b63774eb04a10259c7d674980c591e097bbee641464329732ec7148868219914
  */
});

exports.getResetPasswordPage = catchAsync(async (req, res, next) => {
  const hashed_reset_token = crypto
    .createHash("sha256")
    .update(req.params.path_as_reset_token)
    .digest("hex");

  const user = await User.findOne({
    hashed_passwordResetToken: hashed_reset_token, // data (hashed_reset_token) must have matched hashed_passwordResetToken (the token stored in user's document)

    //Time limit for token
    passwordResetExpires: {
      $gt: Date.now(), // ex: the value of passwordResetExpires was 1591941874576 (2020/06/12 14:00) and 10 more minutes will be added to the value then will be 1591942529921 (1000*60*10 added)
    },
  });

  if (!user) {
    let error = new CustomError("Token is invalid or has expired", 401);

    return res.status(401).render("./error_pages/page_401_unauthorized", {
      title: "Unauthourized",
      error_message: error.error_message,
    });
  }
});

// Let user use the reset link in the mail to reset password
exports.resetPasswordWithToken = catchAsync(async (req, res, next) => {
  const hashed_reset_token = crypto
    .createHash("sha256")
    .update(req.params.path_as_reset_token)
    .digest("hex");

  User.findOne({
    hashed_passwordResetToken: hashed_reset_token, //
    passwordResetExpires: {
      $gt: Date.now(), // ex: the value of passwordResetExpires was 1591941874576 (2020/06/12 14:00) and 10 more minutes will be added to the value then will be 1591942529921 (1000*60*10 added)
    },
  })
    .then((user) => {
      console.log("\n user document in resetPasswordWithToken() :", user);

      if (!user) {
        return res
          .status(401)
          .json(new CustomError("Token is invalid or has expired", 401));
      }

      console.log("\n user document in resetPasswordWithToken() :", user);

      // 2-1) If all query are successfully completed, then save the current user's properties with data passed-in from PATCH request
      user.password = req.body.reset_new_password;
      user.hashed_passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      // 3) Update the changedPasswordAt property for the user
      user.passwordChangedAt = Date.now();

      user.save().then((userData) => {
        console.log(
          'User: "',
          user.name,
          '" has successfully reset the password'
        );

        res.status(200).json({
          status: "success",
          message: "Password reset successful.",
          data: {
            user: user,
          },
        });
      });
    })

    .catch((e) => {
      console.log("Error while resetting password\n", e);

      return res.status(400).json({
        statusCode: 400,
        status: "fail",
        isOperational: true,
        error_message: "Error while resetting password",
      });
    });
});


