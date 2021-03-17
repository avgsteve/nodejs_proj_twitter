export default class NotificationModel {
  constructor() {

  }

  getAllNotification() {
    return new Promise((res, rej) => {
      $.get("api/notifications", function (data, status) {
        res(data);
      }).fail((jqXHR, textStatus) => {
        console.warn(
          'ajax call for getAllNotification has failed! :',
          `Status: ${jqXHR.statusCode}. Reason: ${jqXHR.responseText}`
        );
        rej(null);
      });
    }
    );
  }

  convertNoticeToPopupHtml = (notification) => {
    let userFrom = notification.userFrom;
    let text = this.getNotificationText(notification);
    let href = this.getNotificationUrl(notification);

    // If not opened, will have a blue background set in CSS by class .resultListItem.active
    let classNameForOpened = notification.opened ? "" : "active";

    return `
      <a  href='${href}' 
          class='resultListItem notification ${classNameForOpened}' 
          data-id='${notification._id}'
      >
          <div class='resultsImageContainer'>
              <img src='${userFrom.profilePic}'>
          </div>
          <div class='resultsDetailsContainer ellipsis'>
              <span class='ellipsis'>${text}</span>
          </div>
      </a>`;
  };


  getNotificationText(notification) {

    let userFrom = notification.userFrom;

    if (!userFrom.firstName || !userFrom.lastName) {
      return alert("user from data not populated");
    }

    let userFromName = `${userFrom.firstName} ${userFrom.lastName}`;

    let text;

    if (notification.notificationType === "retweet") {
      text = `${userFromName} retweeted one of your posts`;
    }
    else if (notification.notificationType === "postLike") {
      text = `${userFromName} liked one of your posts`;
    }
    else if (notification.notificationType === "reply") {
      text = `${userFromName} replied to one of your posts`;
    }
    else if (notification.notificationType === "follow") {
      text = `${userFromName} followed you`;
    }

    return `<span class='ellipsis'>${text}</span>`;
  }

  getNotificationUrl(notification) {
    let url = "#";

    if (notification.notificationType === "retweet" ||
      notification.notificationType === "postLike" ||
      notification.notificationType === "reply") {

      url = `/posts/${notification.entityId}`;
    }
    else if (notification.notificationType === "follow") {
      url = `/profile/${notification.entityId}`;
    }

    return url;
  }

  getUnreadMessage() {

    return new Promise((res, rej) => {

      try {

        $.get("/api/chats", { unreadOnly: true }, (data) => {

          // let numResults = data.length;
          // if (numResults > 0) {
          //   $("#messagesBadge").text(numResults).addClass("active");
          // }
          // else {
          //   $("#messagesBadge").text("").removeClass("active");
          // }

          res(data);
        });

      } catch (error) {
        console.warn('error in static getUnreadMessage:', error);
        rej(null);
      }

    }
    );
  }

  markAllNotificationsOpened() {

    return new Promise((res, rej) => {
      $.ajax(
        {
          url: `/api/notifications/markAllAsOpened`,
          type: "PUT",
          success: (response) => {
            console.log('mark all notifications opened successful!:', response);
            res(true);
          },
          error: (jqXHR, exception) => {
            console.warn(
              'ajax call for getAllNotification has failed! :',
              `Status: ${jqXHR.statusCode}. Reason: ${jqXHR.responseText}`
            );
            console.warn(exception);
            rej(false);
          }

        }
      );
    }
    );


  }

  markNotificationsWithIdOpened(notificationId) {

    return new Promise((res, rej) => {
      $.ajax(
        {
          url: `/api/notifications/${notificationId}/markAsRead`,
          type: "PUT",
          success: (data, textStatus, jqXHR) => {
            console.log(
              `notification id: ${notificationId} is marked as opened!. Status: `, textStatus
            );
            res(true);
          },
          error: (jqXHR, exception) => {
            console.warn(
              'ajax call for getAllNotification has failed! :',
              `Status: ${jqXHR.statusCode}. Reason: ${jqXHR.responseText}`
            );
            console.warn(exception);
            rej(false);
          }

        }
      );
    }
    );


  }

}
