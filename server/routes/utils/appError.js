const path = require('path');

// Use and modify built-in Error class as new error-handling Object which has certain property containing specific error information
//  and the obj will be used in next() is app.js and inside the function app.all("*", .... )  like:
//  next( new AppError(`Can't find ${req.orinalUrl} on this server!`,   404)    );

class AppError extends Error {
  //ref:  https://nodejs.org/api/errors.html#errors_class_error

  constructor(message, statusCode) {

    super(message); // whatever data passes in as parameter "message" will be the the "error.message" property

    //add new property to the new class "AppError"
    this.statusCode = statusCode;

    //the statusCode starts with '4' have string 'fail'
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    //The property .isOperational is used to show "There's an operational error" instead of a "coding" error
    this.isOperational = true;

    this.error_message = message;

    // Error.captureStackTrace(targetObject[, constructorOpt])
    // Creates a .stack property on "this" and returns a string representing the location in the code at which Error.captureStackTrace() was called.
    Error.captureStackTrace(this, this.constructor);
    //ref:  https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt

  }

}

module.exports = AppError;