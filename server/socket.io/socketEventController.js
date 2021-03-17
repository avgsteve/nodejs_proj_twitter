const chalk = require('chalk');
const { socketEventNames: socketEvent } = require('./eventNames');

// original code to start socket.io:
// const io = require("socket.io")('http://localhost:3003', { pingTimeout: 60000 });


const socketEvents = (clientSocket) => {

  console.log(
    chalk.cyan('Server message:') +
    chalk.yellow('[') +
    chalk.green('Socket.io initialized') +
    chalk.yellow(']')
  );

  clientSocket.on(socketEvent.setupWebSocketConnection,
    userData => {
      console.log(
        chalk.yellow(
          `The user: ${chalk.green(userData.userName)} has established socket connection with server`
        )
      );
      console.log('userData._id joined:', userData._id);
      clientSocket.join(userData._id.toString()); // join "Room"
      clientSocket.emit("connectedToServerSuccessful");  // emit event to "Room"


    });


  // 使用 .join('內容') 建立一個可以讓其他使用者(clientSocket) 可以接收訊息的 '空間'
  //  clientSocket.on("join room",
  //    room => {
  //      console.log('Socket.on("join room") : 加入對談 join room: ', room);
  //      clientSocket.join(room);
  //    }
  //  );

  clientSocket.on(socketEvent.startChatById, chatRoomId => {
    console.log('Chat has a new user joined. Chat doc id: ', chatRoomId);
    clientSocket.join(chatRoomId);
  });

  // 透過上面的 chatRoomId ，讓下面程式碼裡面的 in(room) 可以在同一個room id中發送訊息
  // With the chatRoomId, let the code below with "in(chatRoomId)" can send
  // (or we can say "emit") message to client joined the same chatRoomId
  clientSocket.on("is typing", chatRoomId => {
    // console.log('Socket.on("is typing"): User is typing');
    clientSocket.in(chatRoomId).emit("typing");
  });

  clientSocket.on("stop typing", chatRoomId => {
    console.log('Socket.on("stop typing"): User has stopped typing');
    clientSocket.in(chatRoomId).emit("stop typing");
  });

  clientSocket.on(socketEvent.newChatMessageFromClient,
    newMsgFromClient => {

      // 1) Check parameters
      let chat = newMsgFromClient.chat;
      if (!newMsgFromClient.chat)
        throw Error(".chat in not found in newMsgFromClient object");
      if (!chat.usersInChat)
        return console.warn(".usersInChat in not found in chat object");

      // 2) Send messages to user id listed in chat document
      chat.usersInChat.forEach(chatUser => {
        // Be careful here: chatUser is only the user id
        if (chatUser === newMsgFromClient.sender._id) return;
        clientSocket.in(chatUser)
          .emit(socketEvent.newChatMessageToClient, newMsgFromClient);
      });

    });

  clientSocket.on(socketEvent.newNotificationFromClient,

    recipientId => {

      console.log('Received socket event: newNotificationFromClient');

      clientSocket
        .in(recipientId)
        // just inform the user that there's
        // a notification has just been created
        .emit(
          socketEvent.newNotificationToClient,
          `new notification for user: ${recipientId}`
        );

      // Todo: design a buffering function to limit times of sending notification to recipient within a time window so the recipient won't be bombarded by notifications if there are multiple users sending notifications to recipient.
    }
  );

};


exports.module = {
  socketEvents
};