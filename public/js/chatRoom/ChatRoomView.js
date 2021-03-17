import ChatRoomModel from './ChatRoomModel';
let chatRoomModel = new ChatRoomModel();
class ChatRoomView {

  constructor() {
    let currentPagePath = window.location.pathname;
    let chatIdFromUrl = currentPagePath.split('/')[3];
    this._chatId = chatIdFromUrl;
  }

  get chatId() {
    return this._chatId;
  }


  async refreshChatTitle() {
    if (!this.chatId)
      throw Error('Need chatId for ChatRoomView.refreshChatTitle()');
    let chatTitle = await chatRoomModel.getChatNameViaAPI(this.chatId);
    $('#titleOfChatRoomPage').text(chatTitle);

  }

  scrollToBottom(
    {
      smoothScroll = true,
      elementToScroll = $(".MessageArea")
    } = {}
  ) {


    let scrollHeight = elementToScroll[0].scrollHeight;

    if (smoothScroll) {
      elementToScroll.animate({ scrollTop: scrollHeight }, "slow");
    }
    else {
      elementToScroll.scrollTop(scrollHeight);
    }
  }

  addMessagesHtmlToPage(
    messageHtml, element = $(".MessageArea")) {
    element.append(messageHtml);
  };

  clearMessageInputArea() {
    $("textarea.messageInput").val("");
    $(".messageInput").val('').text('');
  }

}

export default ChatRoomView;