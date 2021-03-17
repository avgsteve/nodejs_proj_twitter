const CustomError = require('../../errorHandlers/customError');
const User = require('../../../database/schemas/UserSchema');
const Chat = require('../../../database/schemas/ChatSchema');
const Message = require('../../../database/schemas/MessageSchema');
const helpFunction = require('./controllerHelperFunctions');

// path: POST@root/api/message/
// function: Use chat id to create a new message in chat
exports.createNewChatMessage = async (req, res, next) => {

  const chatIdForMessage = req.body.chatId;
  const currentUser = res.locals.user;
  const contentForNewMessage = req.body.content;

  // 1) check req.body and prepare data
  if (!contentForNewMessage || !chatIdForMessage)
    return helpFunction.sendInvalidBodyResponse(req, res);

  // 2)  Defensive programming: In case malicious user uses api to create message in the chat that the user doesn't belong to
  const userIsInChat = await
    helpFunction.chkIfUserIsInChat(currentUser._id, chatIdForMessage);

  if (!userIsInChat)
    return helpFunction.sendUserIsNotValidResponse(req, res);

  // 3) Prepare data for creating a new chat message
  let newMessage = {
    chat: chatIdForMessage,
    sender: currentUser._id,
    content: contentForNewMessage,
  };

  console.log(`New chat message: `, newMessage);

  // 4) Create message ,process created message and update other document
  Message.create(newMessage).then(async (createdMsg) => {

    console.log('createdMsg:', createdMsg);

    let populatedMsg = createdMsg;
    // 4-1) populate fields : send
    populatedMsg = await User.populate(
      createdMsg,
      {
        path: 'sender',
        select: '_id userName firstName lastName profilePic'
      });

    // 4-2) populate fields : chat
    populatedMsg = await Chat.populate(
      createdMsg,
      {
        path: 'chat',
        // ↑↑ for creating message html in front page
      });

    console.log('populatedMsg: \n', populatedMsg);

    // 4-3) Update the field "chat.latestMessage" so front-end page 
    // can use chat's latest message as preview
    let updateChatDocument = await
      helpFunction.updateChatDocAfterNewMsgIsCreated(populatedMsg);
    
    console.log('updateChatDocument:', updateChatDocument);

    if (updateChatDocument.latestMessage !== populatedMsg._id)
      return res.status(201).send(populatedMsg);

    let errorMsg = `The updated chat document's latestMessage doesn't match the new message's id:`;
    console.log({ updateChatDocument, populatedMsg });
    throw Error(errorMsg)

  }
  ).catch(error => {
    console.log(
      'something went wrong (in exports.createNewChatMessage):\n'
      , error);
    res.sendStatus(400);
  });
};


