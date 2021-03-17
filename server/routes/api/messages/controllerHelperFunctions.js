
const CustomError = require('../../errorHandlers/customError');
const mongoose = require('mongoose');
const Chat = require('../../../database/schemas/ChatSchema');
const Notification = require('../../../database/schemas/NotificationSchema');
exports.sendInvalidBodyResponse = (req, res) => {
  let errorMsg = 'Need valid content and chatId for creating a new message';
  console.log(errorMsg);
  console.log({ "req.body.content": req.body.content, "req.body.chatIdForMessage": req.body.chatIdForMessage });
  res.sendStatus(400).json(new CustomError(errorMsg, 400));
  return;

};


exports.sendUserIsNotValidResponse = (req, res) => {
  let errorMsg = `The user ${res.locals.user.userName} is not a member of the chat: ${req.body.chatId}. So not allowed to create new message`;
  console.log(errorMsg);
  return res.sendStatus(400).json(new CustomError(errorMsg, 400));

};

exports.chkIfUserIsInChat = async (userId, chatId) => {

  let checkIfUserIdIsValid = mongoose.Types.ObjectId.isValid(userId);
  if (!checkIfUserIdIsValid) throw Error('userId is not a valid MongoDB ObjectId format');

  let checkIfChatIdIsValid = mongoose.Types.ObjectId.isValid(chatId);
  if (!checkIfChatIdIsValid) throw Error('chatId is not a valid MongoDB ObjectId format');

  let userToChk = Chat.find(
    {
      _id: chatId,  // condition#1: _id field
      usersInChat:  // condition#2: usersInChat field
      {
        $elemMatch: {
          $eq: userId
        }
      }
    }
  );

  return userToChk !== null ? true : false;

};

createMsgNotificationToChatUsers = async (chatDocument, messageDocument) => {
  let msgSender = messageDocument.sender;

  chatDocument.usersInChat.forEach(userInChat => {

    if (userInChat._id === msgSender._id.toString()) return;
    // Notification with the same once
    Notification.insertNotification(
      userInChat._id,
      msgSender._id,
      "newMessage",
      messageDocument.chat._id);
  });

  let updateChatDocument = await Chat
    .findByIdAndUpdate(
      chatDocument._id,
      // if true, no need to create the same notification next time sending a new message
      { notificationForAllUsersWasCreated: true },
      { new: true }
    );

  console.log('new chat document with updated notificationForAllUsersWasCreated:', updateChatDocument);

  return updateChatDocument;
};

exports.updateChatDocAfterNewMsgIsCreated = async (populatedNewMsg) => {

  if (!populatedNewMsg)
    throw Error('Need to passing populated new message');

  if (!populatedNewMsg.chat._id)
    throw Error('Chat is not populated in new message');

  let updatedNewChatDoc;

  updatedNewChatDoc = await Chat.findByIdAndUpdate(
    populatedNewMsg.chat._id,                // #1 "Chat" doc to update
    { latestMessage: populatedNewMsg._id },  // #2 fields and value to update
    { new: true });                        // #3 update option


  if (!updatedNewChatDoc.notificationForAllUsersWasCreated) {
    updatedNewChatDoc = await createMsgNotificationToChatUsers(updatedNewChatDoc, populatedNewMsg);
  }

  return updatedNewChatDoc;
}
