import GlobalViewModel from './GlobalViewModel';
const globalViewModel = new GlobalViewModel();

import ChatListModel from './../chatList/ChatListModel';
import GlobalView from './GlobalView';

export default class GlobalViewControl {

  static createdInstance = null;

  constructor(checkForSingletonInstance) {
    if (!checkForSingletonInstance) {
      return console.log('Please use GlobalViewControl.getSingletonInstance() to get instance');
    }

    this.toggleSideMenu();
    this.mobileLayoutUnderWidth();
    this.draggableElements();

  }

  static getSingletonInstance() {

    if (this.createdInstance !== null) return this.createdInstance;

    let instance = new GlobalViewControl(true);
    this.createdInstance = instance;
    return this.createdInstance;
  }

  async refreshNotificationsBadge() {
    let unreadCounts = await globalViewModel.getUnreadNotifications();
    if (unreadCounts > 0)
      return GlobalView.activateNotificationBadge(unreadCounts);
    GlobalView.deactivateNotificationBadge();
  }

  async refreshMessagesBadge() {
    $(async () => {
      // unread message counts equal to unread chat counts
      let unreadCounts = await ChatListModel.loadUnreadChatData(true);
      if (unreadCounts > 0)
        return GlobalView.activateMessagesBadge(unreadCounts);
      GlobalView.deactivateMessagesBadge();
    }
    );
  }

  // Called by: GlobalSocketEventsHandler.event_newNotificationToClient
  // Let client fetch latest notice data from api
  // Then convert it to html and pop up in page
  async showNoticeInPopup() {

    let latestNoticeData =
      await globalViewModel.getLastNotification();

    let popupMarkup = globalViewModel.convertNoticeToPopupHtml(latestNoticeData);

    GlobalView.showMessagePopup(popupMarkup);
  }

  mobileLayoutUnderWidth(threshold = 480) {

    if ($(window).width() < threshold) {
      GlobalView.showMobileLayout(true);
    } else {
      GlobalView.showMobileLayout(false);
    }
    

    $(window).on('resize', () => {
      if ($(window).width() < threshold) {
        GlobalView.showMobileLayout(true);
      } else {
        GlobalView.showMobileLayout(false);
      }
    });
  }

  draggableElements() {

    $(() => {
      $('.floatingMenuButtonContainer').draggable();
    });

  }


  toggleSideMenu() {
    $('.sideMenuToggleBtn').on('click', () => {

      if ($('.nav-col').hasClass('active')) {
        GlobalView.showSideMenu(false);
        window.localStorage.setItem('keepSideMenuOpen', false);
        // console.log('sideMenuStatus: ', window.localStorage.getItem('keepSideMenuOpen'));
        return
      }

      GlobalView.showSideMenu(true);
      window.localStorage.setItem('keepSideMenuOpen', true);
      // console.log('sideMenuStatus: ', window.localStorage.getItem('keepSideMenuOpen'));

    });
  }

}


