import { createUserHtml } from './../user/createUserHtml';

import ChatListModel from './ChatListModel';

class ChatListView {

  constructor() {
  }

  // updateSelectedUsersHtml
  static updateSelectedUsersInInput(selectedUsers) {
    let markupOfSelectedUsers = [];

    selectedUsers.forEach(user => {
      let name = user.firstName + " " + user.lastName;
      let userSpanTag = $(`<span class='selectedUser'>${name}</span>`);
      markupOfSelectedUsers.push(userSpanTag);
    });

    $(".selectedUser").remove(); // 先移除所有已經在畫面的元素
    $("#selectedUsers").prepend(markupOfSelectedUsers); // 重新加入所有已經生成的使用者標籤元素

    // Debugging Message
    // console.log(' markupOfSelectedUsers: ', markupOfSelectedUsers);
    // console.log('rebuilt #selectedUsers element:', $("#selectedUsers"));
  }

  static outputChatList(chatListData = [], container) {
    chatListData.forEach(chat => {
      let html = ChatListModel.createChatHtml(chat);
      container.append(html);
    });
  }

  static showPreloaderInElement(
    preloaderContainer, preloaderText = 'default', preloaderStyle = 0) {

    if (!preloaderContainer) return;

    // check arguments
    let textToRender =
      typeof preloaderText === 'string' ? preloaderText : 'default';

    let loaderStyleNumber =
      typeof preloaderStyle === 'number' ? preloaderStyle : 0;

    // keep original html in element to restore the container later
    let originalHTML = preloaderContainer.html();
    let loaderElement;

    // loading的時候要顯示的訊息
    if (
      preloaderText !== 'default' && preloaderText !== ""
    ) {
      textToRender = preloaderText;
    }
    else {
      textToRender = 'Refreshing page ...';
    }

    // 2) loading 圖案的樣式
    if (loaderStyleNumber === 0)
      loaderElement = `          
        <div class='spinner_loader' 
            style="
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 2rem;
            "
        >

            <div class="spinner-border text-center" role="status">
                <span class="sr-only">Loading...</span>
            </div>          
            <p> ${textToRender} </p>  
        </div>
      `;

    if (loaderStyleNumber === 1)
      loaderElement = `          
        <div class="loader-container">
            <div class="loader7 loader">
            </div>
            <p> ${textToRender} </p>              
        </div>
      `;


    preloaderContainer.html(loaderElement);
    return originalHTML;

  }
}


export default ChatListView;