export default class GlobalViewModel {
  constructor() {
    this.data = null;
  }

  getUnreadNotifications(showCountsOnly = true) {

    return new Promise((res, rej) => {
      $.ajax(
        {
          url: `/api/notifications/unread?getOnlyCounts=${showCountsOnly}`,
          method: 'GET',
          success: (data, textStatus, jqXHR) => {
            res(data);
          }

        }).fail((data, textStatus, xhr) => {
          console.log('failed to fetch unread  notifications!');
          console.log('data: ', data);
          console.log('textStatus: ', textStatus);
          console.log('xhr.status: ', xhr.status);
          rej(null);
        });

    }
    );


  }

  getLastNotification() {

    return new Promise((res, rej) => {
      $.ajax(
        {
          url: `/api/notifications/latest`,
          method: 'GET',
          success: (data, textStatus, jqXHR) => {
            res(data);
          }

        }).fail((data, textStatus, xhr) => {
          console.log('failed to fetch unread  notifications!');
          console.log('data: ', data);
          console.log('textStatus: ', textStatus);
          console.log('xhr.status: ', xhr.status);
          rej(null);
        });

    }
    );


  }


  // Called by:GlobalViewController.showNoticeInPopup()
  // To convert notice data into html
  convertNoticeToPopupHtml(notificationDoc) {

    if (!notificationDoc || !notificationDoc.userFrom)
      throw Error('incorrect notification data');

    let notificationSender = notificationDoc.userFrom;
    let activeIfNoticeWasOpened = notificationDoc.opened ? "" : "active";

    return `
            <a
                href='${this.popupLinkFromNotice(notificationDoc)}'
                class='resultListItem notification ${activeIfNoticeWasOpened}' 
                data-id='${notificationDoc._id}'
            >

                <div class='resultsImageContainer'>
                    <img src='${notificationSender.profilePic}'>
                </div>

                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis popupNotificationText'>
                      ${this.popupContentFromNotice(notificationDoc)}
                    </span>
                </div>

            </a>`;
  }

  // Create link in popup notice to the page which the notice is for
  popupLinkFromNotice(noticeData) {

    let data = noticeData;
    let url = "#";

    if (data.notificationType == "retweet" ||
      data.notificationType == "postLike" ||
      data.notificationType == "reply") {

      url = `/posts/${data.entityId}`;
    }
    else if (data.notificationType == "follow") {
      url = `/profile/${data.entityId}`;
    }

    return url;
  }

  popupContentFromNotice(noticeData) {

    let data = noticeData;
    let sender = data.userFrom;

    if (!sender.firstName || !sender.lastName) {
      return alert("user from data not populated");
    }

    let noticeSender = `${sender.firstName} ${sender.lastName}`;
    let noticeMessage;

    if (data.notificationType == "retweet") {
      noticeMessage = `${noticeSender} retweeted one of your posts`;
    }
    if (data.notificationType == "postLike") {
      noticeMessage = `${noticeSender} liked one of your posts`;
    }
    if (data.notificationType == "reply") {
      noticeMessage = `${noticeSender} replied to one of your posts`;
    }
    if (data.notificationType == "follow") {
      noticeMessage = `${noticeSender} followed you`;
    }

    return `<span class='ellipsis'>${noticeMessage}</span>`;
  }

  getUnreadChats(showCountsOnly = true) {

    return new Promise((res, rej) => {
      $.ajax(
        {
          url: `/api/chats/unread?getOnlyCounts=${showCountsOnly}`,
          method: 'GET',
          success: (data, textStatus, jqXHR) => {
            res(data);
          }

        }).fail((data, textStatus, xhr) => {
          console.warn('failed to fetch unread  notifications!');
          console.warn('data: ', data);
          console.warn('textStatus: ', textStatus);
          console.warn('xhr.status: ', xhr.status);
          rej(null);
        });

    }
    );


  }

  // === instance methods ===
  createChatHtml = (chatData) => {

    let chatName = chatData.chatName || 'New Chat';
    let chatRoomImage = this._getChatImageElements(chatData);
    let latestMessage = this._getLatestMessage(chatData.latestMessage);

    let activeClass =
      !(chatData.latestMessage) ||
        (chatData.latestMessage.readBy.includes(userLoggedIn._id)) ?
        "" : "active";

    return `
        <a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
            ${chatRoomImage}
            <div class='resultsDetailsContainer ellipsis'>
                <span class='heading ellipsis' >${chatName}</span>
                <span class='subText ellipsis'>${latestMessage}</span>
            </div>
        </a>
    `;
  };

  _getLatestMessage(latestMessage) {
    if (latestMessage != null) {
      let sender = latestMessage.sender;
      return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
    }

    return "New chat";
  }

  _getChatImageElements(chatData) {
    let otherChatUsers = this._getOtherChatUsers(chatData.usersInChat);

    let groupChatClass = "";
    let chatImage = this._getUserChatImageElement(otherChatUsers[0]);

    if (otherChatUsers.length > 1) {
      groupChatClass = "groupChatImageContainer";
      chatImage += this._getUserChatImageElement(otherChatUsers[1]);
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
  }

  _getOtherChatUsers(users) {
    if (users.length === 1) return users;

    return users.filter(user => user._id != userLoggedIn._id);
  }

  _getOtherChatUsers(users) {
    if (users.length === 1) return users;

    return users.filter(user => user._id != userLoggedIn._id);
  }

  // Todo: use this to keep menu open.
  sideMenuIsOpened(isOpened) {

    let status = window.localStorage.getItem('keepSideMenuOpen');

    if (status === null)
      window.localStorage.setItem('keepSideMenuOpen', false);

    if (isOpened === undefined)
      return status;  // return current saved value

    // Check type and use argument toggled to set the value of 'sideMenuToggled'
    if ((typeof isOpened) !== 'boolean')
      throw Error(`parameter 'toggled' must be boolean type`);
    
    // update the value of key: 'keepSideMenuOpen' 
    window.localStorage.setItem('keepSideMenuOpen', isOpened);
    return status;
  }



}