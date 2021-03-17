export default class NotificationView {

  constructor() {
  }

  outputNotificationList(
    notificationsList = [], container = $(".resultsContainer")
  ) {
    notificationsList.forEach((notificationsHtml) => {
      container.append(notificationsHtml);

    });
    if (notificationsList.length === 0) {
      container.append("<p class='noResults'>No notification found</p>");
    }
  }

  makeReadAllButtonActive() {
    let btn = $('#markNotificationsAsRead');
    btn.addClass('active');
    btn.attr('title', 'Click to make all notifications read!');
  }

}
