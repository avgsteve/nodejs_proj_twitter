// there's already a socket.io instance in index.js
// so get the created one in case of bug by creating multiple socket instance
import SocketIoController from './../clientSideSocket.io/SocketIoController';
let socket = SocketIoController.getCreatedInstance();

import { socketEventNames as socketEvent } from './../../../server/socket.io/eventNames';

import ChatRoomView from './ChatRoomView';
// Create new Class instance in ChatRoomController constructor function
let chatRoomView;

import ChatRoomModel from './ChatRoomModel';
// Create new Class instance in ChatRoomController constructor function
let chatRoomModel;

let isInChatRoomPage = window.location.pathname.includes('chatRoom');


export default class ChatRoomSocketEvent {

  constructor() {
    chatRoomView = new ChatRoomView();
    chatRoomModel = new ChatRoomModel();
    this.incomingEventHandler();
  }

  incomingEventHandler() {

    socket.on("typing", () => {
      // console.log('收到socket訊息: typing');
      $(".typingStatusGif").show();
    });

    socket.on("stop typing", () => {
      // console.log('收到socket訊息: stop typing');
      $(".typingStatusGif").hide();
    });

    // === Chat Room Events () ===
    socket.on(socketEvent.newChatMessageToClient, (newMessage) => {

      // console.log('receiving new chat message! ', newMessage);
      // console.log('isInChatRoomPage:', isInChatRoomPage);
      if (!isInChatRoomPage) return;

      let messagesHTML = chatRoomModel.createMessageHtml(
        newMessage, null, "" // output only one received message
      );
      chatRoomView.addMessagesHtmlToPage(messagesHTML);
      chatRoomView.scrollToBottom({
        smoothScroll: true
      });
    });

  }

}