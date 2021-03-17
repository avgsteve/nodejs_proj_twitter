const { validationResult } = require('express-validator');
const CustomError = require('./customError');

const checkReqBodyErrors = (
  req, res, next
) => {
  // console.log('validating error from post request now:');
  // console.log('req.body: ', req.body);

  const { errors: errorsArray } = validationResult(req);
  // console.log('req data:', req);
  if (errorsArray.length > 0) {
    // console.log('found error: ', errorsArray);
    const error = new CustomError(errorsArray, 400, {
      errorLocation: req.originalUrl
    });
    console.log('found error: \n', error);
    return res.status(400).json(error);
  }
  next();
};

module.exports = {
  checkReqBodyErrors
};