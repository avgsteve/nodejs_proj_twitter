const path = require('path');
const scriptName = path.basename(__filename);
// const Tour = require('./../models/tourModel');

//refactoring code by using class
class APIFeatures {
  constructor(query, queryString) {
    // First parameter "query" is the query obj from using mongoose's 'Model class' ,
    // Second parameter "queryString" is the req.query's key and values string from the parsed URL request by express.js
    this.query = query; //ex: after using Query methods like Tour.find() , Tour.sort() etc,.
    this.queryString = queryString;
    // captured query string parameter from HTTP requests. Ex: req.query.page, req.query.field etc,.
  }

  //APIfeatures.filter()
  filter() {
    const queryObj = {
      ...this.queryString
      // ex:   duration: { gte: '5' },   fields: 'name,duration,difficulty,price'
    };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // // making the processed JSON strings back to Obj format and save it back to this.query
    this.query = this.query.find(JSON.parse(queryStr));

    return this; //makes APIfeatures.filter() has props and value of the whole updated Obj
  }

  //APIfeatures.sort()
  sort() {
    // // 2) SORTING ( with mongoose Model.find().sort() )
    if (this.queryString.sort) {
      /*  req.query.sort obj examples
      //ex: http://127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage
      //then the sorting string of req.query.sort will be : { sort: '-price,ratingsAverage' }
      */

      // reformat the sorting string (value of this.queryString.sort, ex: sort: '-price,ratingsAverage')
      // from sort: "x,y" to "x y" to match the format of arguments for .sort()
      const newSortingQuery = this.queryString.sort.split(",").join(" ");

      console.log('\nReformated sorting string from "req.query.sort"is :  ' + newSortingQuery + '\n');
      /* sorting method examples :
    //  **** sort by "field" ascending and "test" descending
    query.sort({ field: 'asc', test: -1 });
    //  **** equivalent
    query.sort('field -test');
*/
      //update the this.query with a new query after executing method of ".sort(string)"
      this.query = this.query.sort(newSortingQuery);
      //ref:  https://mongoosejs.com/docs/api/query.html#query_Query-sort

    } else {
      //provide a default sorting string
      this.query = this.query.sort('price');
    }

    return this; // return the whole updated class instance itself

  }

  //APIfeatures.limit()
  limitFields() {
    // 3) Field limiting (projecting) by using .select() method
    // (to send back only required key-value to reduce the size of requested data)
    if (this.queryString.fields) {

      const selectedFields = this.queryString.fields.split(",").join(" ");

      //       console.log('\nString from req.query.fields: \n  ==>' + this.queryString.fields + "\n reformated to :  \n --->" + selectedFields + "\n");

      this.query = this.query.select(selectedFields); // selectedFields = "fieldA fieldB"

      // ex:
      // include a and b, exclude other fields
      // query.select('a b');
      // exclude c and d, include other fields
      // query.select('-c -d');
      // ref:  https://mongoosejs.com/docs/api/query.html#query_Query-select

    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) Pagination (by using .skip() and .limit() methods )

    // Set default value of page from the .page property
    const page = +this.queryString.page || 1;
    // To pre-define the limit of maximun number of results to be returned
    const limit = +this.queryString.limit || 100;
    // how many documents to skip in the result, page 2 will skip the number of limit multiplied by the page before (which is page - 1)
    const skip = (page - 1) * limit;

    console.log(`\x1b[31m\nCurrent query output limit is : ${limit}\x1b[0m,\nCurrent page is #${page} and there are ${skip} of the results have been skipped`);

    // Decide how many results to skip and the maximun number of results
    // ex: page 2 is result #11 to #20 -->
    this.query = this.query.skip(skip).limit(limit);
    /* ref:
    //page=2&limit=10, 1-10 is page 1, 11-20 is page 2,
    // .skip:  https://mongoosejs.com/docs/api/query.html#query_Query-skip
    // .limit:  https://mongoosejs.com/docs/api/query.html#query_Query-limit
*/

    /*  (No need to throw an error when user gets NO data if the user uses too much number of pages )

        if (this.queryString.page) {

          // .countDocuments() will return how many results from the query
          const numOfTourResults = this.query.countDocuments(); //will return a query Promise obj

          // ref:  https://mongoosejs.com/docs/api/model.html#model_Model.countDocuments

          if (skip >= numOfTourResults) throw new Error('The number of skip is greater than query numbers');

          // the new Error message in try { ... } method will be moved on to catch { } block as error message and trigger status 404 content immediately

        }
    */
    return this;

  }

}

module.exports = APIFeatures; // exporting the class APIFeatures