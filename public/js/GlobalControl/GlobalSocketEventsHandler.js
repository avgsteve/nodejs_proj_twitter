// Import client side socket.io by creating instance from customized socketControll
import SocketIoController from '../clientSideSocket.io/SocketIoController';
let socket = SocketIoController.getCreatedInstance();

// Mapping client side event name to server side event name 
// (in case of typo)
import { socketEventNames as socketEvent } from '../../../server/socket.io/eventNames';

// Use global view control to show notification
// to handle server socket event
import GlobalViewControl from './../GlobalControl/GlobalViewControl';
const globalViewControl = GlobalViewControl.getSingletonInstance();

export default class GlobalSocketEventsHandler {

  constructor() {
    this.initSocketEventHandler();
  }

  initSocketEventHandler() {
    this.event_newMessageToClient();
    this.event_newNotificationToClient();
  }

  // === Handler for receiving a new message ===
  event_newMessageToClient() {

    socket.on(socketEvent.newChatMessageToClient,
      (newMessage) => {
        console.log(
          'New chat message received by global socket event handler ! '
          , newMessage);

        // no need to update MessagesBadge if the user is
        // in the same chat room reading the same message
        if (!chatIdMatchesCurrentChatRoomId(newMessage)) {

          // console.log('call globalViewControl.refreshMessagesBadge');

          globalViewControl.refreshMessagesBadge();

          // Note: No to show popup for messages as there might be too many messages sending at the same time
          // globalViewControl.showNoticeInPopup();
        }


      });
  }

  // === Handler for receiving a new notification ===
  event_newNotificationToClient() {

    socket.on(socketEvent.newNotificationToClient,

      (notificationData) => {
      console.log(
        'New notificationData received by global socket event handler ! '
        , notificationData);

      // update notification Badge
      globalViewControl.refreshNotificationsBadge();
      globalViewControl.showNoticeInPopup();
    });
  }


}

// Check if received message is for current chat room by checking url
function chatIdMatchesCurrentChatRoomId(newMessage) {

  if (!newMessage) return false;
  let currentUrl = window.location.pathname;
  if (newMessage.chat && currentUrl.includes(newMessage.chat._id))
    return true;

  return false;
}