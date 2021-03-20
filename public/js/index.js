// import $ from 'jquery';
import '@babel/polyfill';

// initial socket.io client side script
import SocketIoController from './clientSideSocket.io/SocketIoController';
const socket = SocketIoController.build_singleton_instance();

// initial socket.io client side event handler
// globally handle all incoming socket event data or messages
import GlobalSocketEventsHandler from './GlobalControl/GlobalSocketEventsHandler';
const globalSocketEventsHandler = new GlobalSocketEventsHandler();

import GlobalViewControl from './GlobalControl/GlobalViewControl';
const globalViewControl = GlobalViewControl.getSingletonInstance();

import PostController from './post//postController';

import SearchPageController from './search/searchPageController';

import ProfilePageController from './profile/profilePageController';

import ChatListController from './chatList/ChatListController';

import ChatRoomController from './chatRoom/ChatRoomController';

import ImageUploader from './../js/image-uploader/imageUploadController';

import NotificationController from './../js/notification/NotificationController';

import MePageController from './../js/mePage/mePageController'


$(async () => {

  const currentPagePath = window.location.pathname;
  console.log('currentPagePath: ', currentPagePath);
  const postController = new PostController();
  const imageLoader = new ImageUploader();

  globalViewControl.refreshNotificationsBadge();
  globalViewControl.refreshMessagesBadge();

  // refreshMessagesBadge();
  // refreshNotificationsBadge();

  // Home Page
  if (currentPagePath.trim() === '/') {
    postController.renderAllPostInPage();
    postController.initPostEventListener();
    console.log('進入首頁');
  }

  // === Posts Page (page with post Id) ===
  if (
    currentPagePath.match(/posts/g) &&
    currentPagePath.split('/')[2] !== undefined
  ) {
    postController.renderPostIdPage();
    postController.initPostEventListener();
  }


  // === Notifications Page ===
  if (currentPagePath.match(/notifications/g)) {
    console.log('notification page');
    let notificationController = new NotificationController();
  }

  // === Chat (Message) list page ===
  if (currentPagePath.match(/message/g)) {
    // ex: http://localhost:3003/messages/ 等於 ["","message",""
    // console.log('目前在對話清單頁面');
    let chatListController = await ChatListController.async_build_instance();
  }

    // === Chat room page ===
  if (currentPagePath.match(/chat/g)) {
    new ChatRoomController();
  }

  
  // profileContentController is for "Search" and "Profile" pages
  // that will render user data in page  
  let profileContentController = new ProfilePageController();

  // === Search Page ===
  if (currentPagePath.match(/search/g)) {
    new SearchPageController();
    // let user can follow users shown in search results
    // profileContentController._clickFollowBtnToFollowUser();
  }


  // === Profile Page ===
  if (currentPagePath.match(/profile/g)) {
    postController.initPostEventListener(); // let user perform actions on posts in profile page

    if (currentPagePath.match(/follow/g)) {
      profileContentController.renderFollowerPage();
    }

    if (!currentPagePath.match(/follow/g)) {
      profileContentController.renderProfilePage();
    }
  }

  // === Me Page ===
  if (currentPagePath.match(/me/g)) {
    let ePageController = new MePageController();
  }



});