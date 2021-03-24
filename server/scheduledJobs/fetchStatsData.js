const fs = require('fs');
const path = require('path');
const UserDocument = require('./../database/schemas/UserSchema');
const PostDocument = require('./../database/schemas/PostSchema');
const MessageDocument = require('./../database/schemas/MessageSchema');

let dataAsObj = require('../database/statisticData');

exports.fetchStatsData = async () => {
  {
    let data = {};
    let currentTime = new Date().toISOString();

    data.totalRegisteredUsers = await getDocCounts(UserDocument);
    data.totalCreatedPosts = await getDocCounts(PostDocument);
    data.totalPostLikes = await getItemCountsFromDocField(UserDocument, 'likes');
    data.totalPostRetweets = await getItemCountsFromDocField(UserDocument, 'retweets');

    data.lastUpdated = currentTime;

    return data;
  }
};

// Use local file: statsData.json as cache for statistic data for front-end API
// as the client will require statistic data every time the login page loads
exports.writeJsonDataToFile = (data) => {

  let dataToWrite = JSON.stringify(data);
  let filePath = path.join(__dirname, './../database/');

  dataAsObj.data = data; // overwrite the data property with the data argument

  fs.writeFileSync(
    `${filePath}statsData.json`,
    // absolute path: D:\git\NodeJs\nodejs_twitter\server\database\statsData.json
    dataToWrite,
    (err) => {
      console.log('data is written in file!');
      if (err) throw err;
    });

};

async function getDocCounts(MongooseModel) {
  // console.log('check: ', MongooseModel instanceof mongoose.MongooseDocument);
  if (!MongooseModel.hasOwnProperty('schema')) {
    console.error(
      `argument: MongooseModel is not correct mongoose document model`);
    return 0;
  }

  return MongooseModel.countDocuments({})
    .then(result => {
      // console.log('registered users: ', result);
      return result;
    })
    .catch(e => {
      console.log(e);
    });
}

async function getItemCountsFromDocField(MongooseModel, fieldName) {

  try {
    // console.log({ MongooseModel, fieldName });    
    if (!MongooseModel.schema.paths.hasOwnProperty(fieldName))
      throw Error(`The mongoose doesn't have this property: ${fieldName}`);

    return MongooseModel.aggregate([
      {
        $match: {}
      },
      {
        $group: {
          // _id: `$${fieldName}Count`, // $fieldNameCount
          _id: `${fieldName}Counts`, // $fieldNameCounts
          total: {
            $sum: {
              $size: `$${fieldName}` // $fieldName
            }

          }
        }
      }
    ])
      .then(result => { return result[0].total; })
      .catch(e => {
        console.log(e);
      });


  } catch (error) {
    console.log('error:', error);
  }
}

