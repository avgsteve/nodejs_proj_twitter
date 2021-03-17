const User = require('../../../database/schemas/UserSchema');
const Chat = require('../../../database/schemas/ChatSchema');
const Message = require('../../../database/schemas/MessageSchema');
const chalk = require('chalk');
const populateUserOption = "_id userName firstName lastName profilePic";


// path: POST@root/api/chats
// function: Create a new chat
exports.createChat = async (req, res, next) => {

  // 1) Check and prepare data
  if (!req.body.usersInChat) {
    console.log("Users param not sent with request");
    return res.sendStatus(400);
  }

  let userCreatingNewChat = res.locals.user;
  let usersInChat_array = JSON.parse(req.body.usersInChat); // usersInChat is json format Array

  console.log(
    `${chalk.yellow('[Creating new chat]')} by user: ${userCreatingNewChat.userName} for users:`,
    chalk.green(
      usersInChat_array.map(user => { return user.userName; }).join(' ,')
    )
  );

  if (usersInChat_array.length === 0) {
    console.log("Users array is empty");
    return res.status(400).json({ message: 'No user found to start a new chat' });
  }

  usersInChat_array.push(userCreatingNewChat);

  let chatData = {
    usersInChat: usersInChat_array.map(user => { return user._id; }),
    // ↑↑ Because .usersInChat takes ObjectId object
    createdByUser: userCreatingNewChat._id,
    isGroupChat: true,
    // chatName: '' // optional field
  };

  Chat.create(chatData)
    .then(
      createdNewChat => {
        console.log('new chat created!: ', createdNewChat);
        res.status(200).send(createdNewChat);
      }
    )
    .catch(
      error => {
        console.log(error);
        res.sendStatus(400);
      }
    );
};

// path: GET@root/api/chats
// query: unreadOnly(Boolean), getUnreadCounts(Boolean)
// function: get all chats created for chat list page
exports.getAllChatsForCurrentUser = async (req, res, next) => {

  Chat.find(
    {
      usersInChat: {
        // 搜尋的文件，條件為 usersInChat array 裡面包含目前使用者
        $elemMatch: {
          $eq: res.locals.user._id
        }
      }
    }
  )
    .populate(
      "usersInChat",
      // choose fields to populate
      populateUserOption)
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async chatDocs => {

      // If the request is intent to fetch unread only, then use the chat.latestMessage property 
      // to find out if current user has read the "latestMessage" or not
      if (_queryIsForReadOnly(req))
        return _sendUnreadChatResponse(chatDocs, req, res);

      let chatDocsPopulated = await User.populate(
        chatDocs,
        {
          path: "latestMessage.sender",
          select: '_id userName firstName lastName profilePic'
        }
      );

      res.status(200).send(chatDocsPopulated);
    })
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    });
};

function _queryIsForReadOnly(request) {
  if (
    request.query.unreadOnly !== undefined &&
    request.query.unreadOnly === "true"
  ) return true;
  return false;
}

function _sendUnreadChatResponse(chatDocuments, request, response) {

  let unreadDocuments = chatDocuments.filter(
    chat => chat.latestMessage &&
      !chat.latestMessage.readBy.includes(response.locals.user._id)
  );

  if (request.query.getUnreadCounts === "true")
    unreadDocuments = unreadDocuments.length.toString();
  // convert to string otherwise will be considered as status code
  // in .send method and cannot be send

  return response.status(200).send(unreadDocuments);
}

// path: GET@root/api/chats/:chatId
// function: get a single chat document
exports.getChatWithId = async (req, res, next) => {
  Chat.findOne(
    {
      _id: req.params.chatId,
      usersInChat:
      {
        $elemMatch: {
          $eq: res.locals.user._id
        }
      }
    })
    .populate("usersInChat")
    .then(results => res.status(200).send(results))
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    });
};



// path: GET@root/api/chats/:chatId/title
// function: get title of a chat document
exports.getTitleOfOneChatWithId = async (req, res, next) => {
  Chat.findOne(
    {
      _id: req.params.chatId,
      usersInChat:
      {
        $elemMatch: {
          $eq: res.locals.user._id
        }
      }
    })
    .then(results => {

      let chatName = results.chatName;
      if (!results.chatName)
        chatName = `New Chat`;

      res.status(200).send(chatName);


    })
    .catch(error => {
      console.log(error);
    });
};

// path: PUT@root/api/chats/:chatId
// function: update a single chat document
exports.updateChatWithId = async (req, res, next) => {

  Chat.findOneAndUpdate(
    {
      _id: req.params.chatId,
      // only user in chat can update chat data
      // in case chat will be updated by users outside the chat
      // for example: chatName property
      usersInChat: {
        $elemMatch: {
          $eq: res.locals.user._id
        }
      }
    },
    req.body, // ToDo: 使用 req.body 進行 update 可能會有風險之後要改掉
    { new: true }
  )
    .then(updatedChatData => { res.status(200).send(updatedChatData); })
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    });
};

// path: GET@root/api/chats/:chatId/messages
// function: get all chat messages
exports.getAllMessageFromOneChat = async (req, res, next) => {
  Message.find({ chat: req.params.chatId })
    .populate("sender", populateUserOption)
    .then(results => res.status(200).send(results))
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    });
};

// path: PUT@root/api/chats/:chatId/messages/markAsRead
// function: get a chat by id and make all its message opened
exports.markMessageAsReadFromOneChat = async (req, res, next) => {
  Message.updateMany(
    {
      chat: req.params.chatId
    },
    {
      $addToSet: { readBy: res.locals.user._id }
    }
  )
    .then(() => res.sendStatus(204))
    .catch(error => {
      console.log(error);
      res.sendStatus(400);
    });
};