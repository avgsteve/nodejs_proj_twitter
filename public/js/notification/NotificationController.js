import NotificationModel from './NotificationModel';
const notificationModel = new NotificationModel();

import notificationView from './NotificationView';
const NotificationView = new notificationView();

import GlobalView from './../GlobalControl/GlobalView';

let currentPagePath = window.location.pathname;

export default class NotificationController {

  constructor() {

    if (!currentPagePath.match(/notifications/g))
      return console.warn(
        `must run NotificationController in notification page!`);

    this.loadNotificationPageEvent();
    this.makeAllNotificationReadEvent();
    this.clickOneNotificationEvent();
  }

  loadNotificationPageEvent() {
    $( // when document is ready
      async () => {

        // 1) Show Preloader
        GlobalView.showPreloaderInElement(
          resultContainer, 'Loading notifications...', 1);

        // 2) Get data and container for rendering results
        let resultContainer = $(".resultsContainer");
        let notifications =
          await notificationModel.getAllNotification();

        if (notifications) {

          // Update UI: Active read all button
          if (this.hasUnOpened(notifications))
            NotificationView.makeReadAllButtonActive();

          // Convert and render results
          let notificationsHtmlArray = notifications.map(
            n => notificationModel.convertNoticeToPopupHtml(n)
          );

          NotificationView.outputNotificationList(
            notificationsHtmlArray, resultContainer
          );
        }
      }
    );
  }

  makeAllNotificationReadEvent() {

    $(document).on("click", "#markNotificationsAsRead.active",
      async () => {

        let confirm = window.confirm('Are you sure to make all messages opened?');
        if (!confirm) return;

        let isSuccessful = await notificationModel.markAllNotificationsOpened();
        if (!isSuccessful) return console.warn(`Can make all notifications opened`);

        GlobalView.showAlert({
          styleOption: 1,
          message: " Succeeded! <br> Reload page now ",
          slideIn: true,
          timeToDisappear: 1300,
        });

        setTimeout(() => {
          location.reload();
        }, 1400);

      }
    );


  }

  clickOneNotificationEvent() {

    $(document).on("click", ".notification.active", async (e) => {
      e.preventDefault();

      // get id in data attribute from a clicked link 
      let clickedLink = e.target.closest("a.notification");
      let notificationId = $(clickedLink).data().id;

      // return console.warn('notificationId:', notificationId);

      // save link for redirecting user later
      let linkUrlSaved = $(clickedLink).attr("href");

      // update notification via API and wait for result
      let isSuccessful = await notificationModel.markNotificationsWithIdOpened(notificationId);

      if (isSuccessful) window.location.assign(linkUrlSaved);
    });

    // For debugging. No actual function implemented
    $(document).on("click", ".notification", async (e) => {
      let clickedLink = e.target.closest("a.notification");
      let notificationId = $(clickedLink).data().id;
      console.log('id from clicked link: ', notificationId);
    });
  }

  hasUnOpened(data = []) {
    return data.some(obj => obj.opened !== true);
  }


}