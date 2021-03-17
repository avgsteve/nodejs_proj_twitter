const User = require('../../../database/schemas/UserSchema');
const Post = require('../../../database/schemas/PostSchema');
const Notification = require('../../../database/schemas/NotificationSchema');
const mongoose = require('mongoose');
const populateUserOption = "_id userName firstName lastName profilePic";


exports.getSumOfLikes = async (req, res) => {

  User.aggregate([
    {
      $match: {}
    },
    {
      $group: {
        _id: 'likesCount',
        total: {
          $sum: {
            $size: "$likes"
          }

        }
      }
    }
  ]).then(result => {
    console.log('likesTotal: ', result);
    res.send(result);
  }).catch(e => {
    console.log('error: ', e);
    res.statusCode(400);
  });

};

exports.getSumOfCreatedPost = async (req, res) => {

  try {
    let count = await Post.countDocuments();
    res.send(count.toString());
  } catch (error) {

  }


};