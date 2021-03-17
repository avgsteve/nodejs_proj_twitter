
const mongoose = require('mongoose');
const Chat = require('./../../../database/schemas/ChatSchema');

// 尋找文件，找不到就建立一個新的 (透過 condition #3 的 upsert 和 condition #2 的內容建立新文件)
// ref: https://stackoverflow.com/questions/25116522/mongoose-findoneandupdate-and-upsert-returns-no-errs-no-documents-affected/34593888
// condition #2 的內容只能是 update operator expressions. ref: https://docs.mongodb.com/manual/reference/operator/update/
function findChatWithOneUserById(userLoggedInId, otherUserId) {
  return Chat.findOneAndUpdate(
    // condition #1
    {
    isGroupChat: false,
    usersInChat: {
      $size: 2, // 尋找只有兩個人的對話文件
      $all: [
        // 且這兩個人都必須在這個文件中
        { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
        { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } }
      ]
    }
    },
    // condition #2
    {
      $setOnInsert: {
        // 要 
        usersInChat: [userLoggedInId, otherUserId]
      }
    },
    // condition #3 兩個參數都要設定
    {
      new: true,
      upsert: true
    })
    .populate("usersInChat");
}

exports.default = findChatWithOneUserById;