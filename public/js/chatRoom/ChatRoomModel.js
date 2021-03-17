import SocketIoController from './../clientSideSocket.io/SocketIoController';

// there's already a socket.io instance in index.js
// so get the created one in case of bug by creating multiple socket instance
let socket = SocketIoController.getCreatedInstance();


class ChatRoomModel {

  constructor() {

    let currentPagePath = window.location.pathname;
    let chatIdFromUrl = currentPagePath.split('/')[3];

    this._isCurrentlyTyping = false;
    this._lastTypingTime = new Date();
    this._emitTypingStatusTimer;
    this._chatId = chatIdFromUrl;
  }

  // === getter & setter methods ===
  get isCurrentlyTyping() {
    return this._isCurrentlyTyping;
  }

  set isCurrentlyTyping(boolean) {
    this._isCurrentlyTyping = boolean;
    return this._isCurrentlyTyping;
  }

  get lastTypingTime() {
    return this._lastTypingTime;
  }

  set lastTypingTime(time = new Date().getTime()) {
    this._lastTypingTime = time;
    return this._lastTypingTime;
  }

  get emitTypingStatusTimer() {
    return this._emitTypingStatusTimer;
  }

  set emitTypingStatusTimer(timeoutTimer) {
    this._emitTypingStatusTimer = timeoutTimer;
    return this._emitTypingStatusTimer;
  }

  get chatId() {
    return this._chatId;
  }

  // === instance methods ===
  getChatName(chatData) {
    let chatName = chatData.chatName;

    if (!chatName) {
      let otherChatUsers = getOtherChatUsers(chatData.usersInChat);
      let namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
      chatName = namesArray.join(", ");
    }

    return chatName;
  }

  createLocalMessage(newMessage) {
    let localMessage = {
      "content": newMessage,
      "_id": "localMessage",
      "createdByUser": userLoggedIn._id,
      "createdAt": new Date().toISOString(),
      "sender": {
        _id: userLoggedIn._id,
        firstName: userLoggedIn.firstName,
        lastName: userLoggedIn.lastName,
        profilePic: userLoggedIn.profilePic,
        lastName: userLoggedIn.userName,
      }
    };

    return localMessage;
  }

  convertMessageDataToJoinHTML(messagesData) {
    let messageHtmlArray = [];
    let lastSenderId = "";

    messagesData.forEach((message, i) => {

      let createdHtml =
        this.createMessageHtml(
          message, messagesData[i + 1], lastSenderId);

      // 4-2) 將 html 放入  messageHtmlArray
      messageHtmlArray.push(createdHtml);
      // 4-3) 更新 lastSenderId
      lastSenderId = message.sender._id;
    });

    let joinedMessageHtml = messageHtmlArray.join("");
    return joinedMessageHtml;
  }

  // async operation
  updateChatNameViaAPI() {
    let newChatName = $("#changeChatTitleTextbox").val().trim();

    return new Promise((res, rej) => {

      $.ajax({
        url: "/api/chats/" + this.chatId,
        type: "PUT",
        data: {
          chatName: newChatName
        },
        success: (data, status, xhr) => {
          if (xhr.status !== 200) {
            alert("could not update");
            rej(false);
          }
          else {
            res(true);
            // location.reload();
          }
        }
      });

    }
    );

  }

  // async operation
  getChatMessagesFromDB() {

    return new Promise((res, rej) => {
      $.get(`/api/chats/${this.chatId}/messages`).
        done(
          (data, statusText, xhr) => {
            let status = xhr.status;                //200
            let head = xhr.getAllResponseHeaders(); // Detailed header nfo          
            res(data);
          }
        ).fail(
          (statusText, xhr) => {
            console.log('error while getting messages for chat data');
            rej(null);
          }
        );
    }
    );



  }

  // async operation
  getChatNameViaAPI(chatId) {

    if (!chatId)
      throw Error('Need chatId for ChatRoomView.getChatNameViaAPI()');

    return new Promise((res, rej) => {

      $.ajax({
        url: "/api/chats/" + chatId + "/title",
        type: "GET",
        success: (data, status, jqXHR) => {
          if (jqXHR.status != 200) {
            console.log('can not get chat title');
            rej(null);
          }
          else {
            res(data);
          }
        },
        error: (jqXHR, exception) => {
          console.warn(
            'ajax call for getAllNotification has failed! :',
            `Status: ${jqXHR.statusCode}. Reason: ${jqXHR.responseText}`
          );
          console.warn(exception);
          rej(false);
      }

      });

    }
    );

  }

  // async operation
  sendNewMessageToApi(newMessage) {

    return new Promise((res, rej) => {

      $.post("/api/messages",
        { content: newMessage, chatId: this.chatId },
        (data, status, xhr) => {
          if (xhr.status != 201) {
            console.log('can not send(create) new message to API');
            rej(null);
          }
          else {
            // console.log('API傳回的訊息: ', data);
            res(data);
          }
        }
      );

    }
    );

  }

  // async operation
  async markAllMessagesAsRead() {

    return new Promise((res, rej) => {
      try {
        $.ajax({
          url: `/api/chats/${this.chatId}/messages/markAsRead`,
          type: "PUT",
          success: () => res(true)
        });

      } catch (error) {
        console.log(`can't mark all message as read`);
        rej(false);
      }
    }
    );

  }


  // === private methods ===
  getOtherChatUsers(users) {
    if (users.length === 1) return users;

    return users.filter(user => user._id != userLoggedIn._id);
  }

  getOtherChatUsers(users) {
    if (users.length === 1) return users;

    return users.filter(user => user._id != userLoggedIn._id);
  }


  getUserChatImageElement(user) {
    if (!user || !user.profilePic) {
      return alert("User passed into function is invalid");
    }

    return `<img src='${user.profilePic}' alt='User's profile pic'>`;
  }

  createMessageHtml(message, nextMessage, lastSenderId) {

    if (message._id === undefined)
      throw Error('please make sure that the passed in "message" obj is a valid message document from mongoDB ');
 
    let sender = message.sender;
    let senderName = sender.firstName + " " + sender.lastName;
    let currentSenderId = sender._id;
    // console.log('current nextMessage:', nextMessage);
    let nextSenderId =
      (nextMessage === null || nextMessage === undefined)
        ? "" : nextMessage.sender._id;

    // Find out if current message is first or last message 
    // around neighboring message blocks
    let isFirstMsgFromSameUser = lastSenderId !== currentSenderId;
    let isLastMsgFromSameUser = nextSenderId !== currentSenderId;

    let msgIsFromCurrentUser = currentSenderId === userLoggedIn._id;
    let msgIsFromOtherUser = currentSenderId !== userLoggedIn._id;

    let liClassName = msgIsFromCurrentUser ? "mine" : "theirs";

    // 顯示其他人訊息的使用者名稱
    let userNameMarkup = "";
    if (isFirstMsgFromSameUser) {
      liClassName += " first";

      if (!msgIsFromCurrentUser) {
        userNameMarkup = `<span class='senderName'>${senderName}</span>`;
      }
    }

    // 使用者頭像
    let profileImgInMsg = "";
    if (isLastMsgFromSameUser) {
      liClassName += " last";
      profileImgInMsg = `<img src='${sender.profilePic}'>`;
    }

    // 是否在訊息顯示使用者頭像
    let imageContainerMarkup = "";
    if (msgIsFromOtherUser) {
      imageContainerMarkup = `
        <div class='imageContainer'>
          ${profileImgInMsg}
        </div>`;
    }

    return `<li class='message ${liClassName}'>
                ${imageContainerMarkup}
                <div class='messageContainer'>
                    ${userNameMarkup}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
  }



  async getUnreadChatData(getUnreadCounts = false) {

    // getUnreadCounts 只會傳回未讀文件的"數量"，而不會傳回整個包含所有細節的未讀文件

    return new Promise((res, rej) => {
      $.get({
        url: `/api/chats`,
        data: {
          // for backend req.query string
          unreadOnly: true,
          getUnreadCounts
        },
        success: (data) => {
          res(data);
        }
      }
      ).fail(function (error) {
        rej(error);
      });
    }
    );
  }


  updateTypingStatus() {

    if (!socket.isConnected) return;

    // console.log('updateTypingStatus called');

    // clear timer that might have been set before
    clearTimeout(this.emitTypingStatusTimer);

    // only emit event when user is not typing
    if (this.isCurrentlyTyping === false) {
      this.isCurrentlyTyping = true;
      socket.emit("is typing", chatId);
    }

    this.setEmitTypingStatusTimer(1500);
  }

  // create a setTimeout and assign to instance filed (this.emitTypingStatusTimer)
  setEmitTypingStatusTimer(timerLength = 2000) {
    this.emitTypingStatusTimer = setTimeout(() => {
      console.log('emit stop typing event to socket');
      socket.emit("stop typing", this.chatId);
      this.isCurrentlyTyping = false;
    }, timerLength);
  }



}

export default ChatRoomModel;