// import { createUserHtml } from './../user/createUserHtml';
import ProfileView from '../profile/profilePageView';
import ChatListView from './ChatListView';
import ChatListModel from './ChatListModel';
let currentPagePath = window.location.pathname;
let $containerForList = $(".resultsContainer");
let $userSearchResult = $(".userSearchResultContainer");
let $userSearchResultMessage = $(".userSearchResultMessage");
let timer_executeSearch;
let selectedUsersArray = [];

class ChatListController {

  static _createdSingletonInstance = null;
  static _createdInstanceCounter = 0;

  constructor(existingChatList = []) {

    if (typeof existingChatList === 'undefined') {
      throw new Error('Please use async_build_instance to create singleton instance');
    }

    this._existingChatList = existingChatList;
    this.event_loadChatList();
    this.event_searchUserForNewChat();
    this.event_createNewChat();
  }

  // 使用 ajax取得的資料加上 singleton pattern 
  // 只允許傳回已經建立的同一個 instance
  static async async_build_instance() {

    if (this._createdSingletonInstance !== null)
      return this._createdSingletonInstance;

    ChatListView.showPreloaderInElement(
      $containerForList, 'Please wait for loading chat data', 1
    );

    // Use chat list data fetched with ajax to create instance with singleton pattern
    let chatList = await ChatListModel.loadChatList();
    let instance = new ChatListController(chatList);

    this._createdSingletonInstance = instance;
    this._createdInstanceCounter++;
  }

  get existingChatList() {
    return this._existingChatList;
  }

  set existingChatList(data) {
    if (!Array.isArray(data)) throw 'argument must be Array';
    this._existingChatList = data;
  }

  event_loadChatList() {

    if (!currentPagePath.match(/list/g)) return;
    console.log('event_loadChatList loaded');

    $(async () => {

      let existingChatList = this.existingChatList;

      // render fetch chat list in page
      if (existingChatList && existingChatList.length !== 0) {
        $containerForList.html("");
        return ChatListView.outputChatList(
          existingChatList, $containerForList);
      }

      // Show 'no result' message if didn't fetch any existing data
      return $containerForList.html(
        ChatListModel.chatListNotFoundMsg()
      );
    });

  }

  event_searchUserForNewChat() {

    // avoid conflict with chat list page
    if (!currentPagePath.match(/new/g)) return;

    let existingChatList = this.existingChatList;

    // render existing chat list as reference
    if (existingChatList && existingChatList.length !== 0) {
      this._showExistingListInSearchPage();
    } else {
      $containerForList.html(
        ChatListModel.chatListNotFoundMsg()
      )
    }

    // 3) Handler for search event
    $("#userSearchTextbox").on('keyup', (event) => {

      // 1) Reset UI and clear existing setTimeout function 
      // for event key up      
      clearTimeout(timer_executeSearch);
      $userSearchResult.html(""); // clear previous search result
      $userSearchResultMessage.css('display', 'none');

      // 2) Get input value
      let searchInput = $(event.target);
      let searchValue = searchInput.val().trim();

      // 3) Show preloader for every keyup
      if (searchValue.length > 0)
        this._showDelayedSearchPreloader('Searching user...');

      // 4) When the input is empty and hits backspace, will
      // delete existing and the last selected user from array
      if (
        searchValue === "" &&
        (event.which === 8 || event.keyCode === 8)
      ) {
        selectedUsersArray.pop();

        ChatListView.updateSelectedUsersInInput(selectedUsersArray);

        // disable create chat button if array is already empty
        if (selectedUsersArray.length === 0) {
          $("#createChatButton").prop("disabled", true);
        }
        return;
      }

      // 每一次輸入搜尋文字後，使用setTimeout延遲執行
      // 搜尋使用者並且輸出到頁面的function
      timer_executeSearch = setTimeout(
        this._searchUserAndRenderResult(
          searchValue, this._renderUserSelectionFunction)
        , 1200
      );


    });
  }

  event_createNewChat() {

    $("#createChatButton").click(() => {
      // 使用 ajax call之前要先把 array 轉成 json 格式，才能送到後端
      let dataOfUsersInChat = JSON.stringify(selectedUsersArray);

      $.post("/api/chats", {
        usersInChat: dataOfUsersInChat
      }, chat => {

        if (!chat || !chat._id)
          return alert("Invalid response from server.");

        window.location.href = `/messages/${chat._id}`;
      });
    });

  }


  _showDelayedSearchPreloader(textToShowInPreloader) {
    setTimeout(() => {
      ChatListView.showPreloaderInElement(
        $userSearchResult,
        textToShowInPreloader,
        1
      );
    }, 500);
  }

  _showExistingListInSearchPage() {

    $containerForList.html(""); // empty previous result first

    ChatListView.outputChatList(
      this.existingChatList, $containerForList);

    $containerForList.prepend(`
      <span class="current-existing-chats-label">
          Current Existing Chats
      </span>
      `);
  }

  _searchUserAndRenderResult(searchValue, renderFunction) {

    return async () => {

      // 使用輸入值查詢使用者
      if (searchValue.trim() !== "") {
        let searchResults =
          await ChatListModel.searchUsersForNewChat(searchValue);        
        // 將查詢到的結果輸出到畫面做為選擇清單
        renderFunction(
          searchResults, $userSearchResult
        );

      }
    };
  }

  _renderUserSelectionFunction(usersData = [], containerAsUserList) {

    containerAsUserList.html("");

    if (usersData.length === 0) {
      containerAsUserList.append(
        "<span class='user-list noResults'>No results found</span>"
      );
      return;
    }

    // Render every user in search results
    usersData.forEach(
      (user) => {

        // skip the user who is current user
        if (
          (user._id === userLoggedIn._id) ||
          (selectedUsersArray.some(userSelected => userSelected._id === user._id))
        ) {
          return;
        }

        // (User ProfileView.createUserHtml) to render user in page
        let createdElement = $(ProfileView.createUserHtml(user, true));

        // and attach event listen to every result
        createdElement.on('click', function (e) {
          // prevent page from jumping to link
          e.preventDefault();
          clickAndAddUserToChat(user);
        });

        containerAsUserList.append(createdElement);
      }
    );

    $userSearchResultMessage.css('display', 'block');

  }

}


function clickAndAddUserToChat(user) {

  selectedUsersArray.push(user);

  // Refresh and render latest selection
  ChatListView.updateSelectedUsersInInput(selectedUsersArray);

  // Reset research input field and button
  $("#userSearchTextbox").val("").focus();
  $userSearchResult.html("");
  $("#createChatButton").prop("disabled", false);
}

export default ChatListController;