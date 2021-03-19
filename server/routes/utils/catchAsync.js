
//catchAsync

// ==== Block 1 the code from course ====
module.exports = fn => { //exported as catchAsync function

  //#1. return the (arrow) function from catchAsync and the function will be assigned back to the exports variable
  //#2. when pass in a function with async method, it means the Promise obj is passed-in as argument ( the fn parameter )
  return (req, res, next) => {

    //The block below is inside an arrow function and the fn().catch() will receive the obj from parameter "fn"
    //This block will be return the uppercase return block as a returned function to provide the value to catchAsync function

    fn(req, res, next).catch(next);
    // fn(req, res, next).catch(err => next(err));

  };

};

