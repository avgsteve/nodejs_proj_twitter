import { error } from 'jquery';
import { createUserHTML } from '../user/createUserHtml';


class ChatListModel {

  static searchUsersForNewChat(searchTerm) {

    return new Promise((res, rej) => {

      $.get("/api/users",
        { searchTerm: searchTerm },
        results => {
          res(results);
          // outputSelectableUsers(results, $(".resultsContainer"));
        })
        .fail(error => {
          let errorMessage = 'error while searching user for message:';
          console.log(errorMessage, error);
          rej([]);
        });
    });
  }

  static loadChatList() {
    return new Promise((res, rej) => {

      $.get("/api/chats", (data, status, xhr) => {
        // console.log('讀取到的 chats data: ', data);
        if (xhr.status === 400) {
          console.log("Could not get chat list.");
          rej(null);
        }
        else {
          res(data);
        }
      });
    });
  }

  static loadUnreadChatData(showCountsOnly = true) {
    return new Promise((res, rej) => {
      try {
        $.get(`/api/chats?unreadOnly=true&getUnreadCounts=${showCountsOnly}`,
          (data, status, xhr) => {
            if (xhr.status === 400) return res(null);
            res(data);
          });
      } catch (error) {
        console.log('error while fetching data for chat list', error);
        rej(null);
      }

    });
  }

  static chatListNotFoundMsg() {
    return `
          <div 
              class='noChatListDataFound' 
              style="
                padding:3rem 1.5rem;  
                font-size:2rem;    
                color: grey;              
              "  
          >
              <p>
                  No data found. Create a new chat ?
              </p>
          </div>
      `;
  }

  static createChatHtml = (chatData) => {

    let activeClass =
      !chatData.latestMessage ||
        chatData.latestMessage.readBy.includes(userLoggedIn._id) ?
        "" : "active";

    return `
      <a  href='/messages/chatRoom/${chatData._id}'       
          class='resultListItem ${activeClass}' 
          >   
              ${this.coverImageFromChatUsers(chatData)}
              
          <div class='resultsDetailsContainer ellipsis'>
              <span 
                  class='heading ellipsis title-of-chat-in-list chat-name-from-data-or-users'>
                  ${this.getChatNameFromDataOrUserNames(chatData)}
              </span>
              <span
                  class='subText ellipsis chat-preview-text'>
                  ${this.latestMessageAsPreview(chatData.latestMessage)}
              </span>
          </div>
      </a>
    `;
  };


  static coverImageFromChatUsers(chatData) {

    let otherChatUsers = this.getOtherUsersFromChat(chatData.usersInChat);
    let imageTags = this.getUserImageTagForChat(otherChatUsers[0]);

    if (otherChatUsers.length > 1)
      imageTags += this.getUserImageTagForChat(otherChatUsers[1]);

    return `
        <div
            class='resultsImageContainer chatListCoverImages
                  ${otherChatUsers.length > 1 ? "groupChatImageContainer" : ""}'>
            <!-- image tags are created by function "coverImageFromChatUsers" -->
            ${imageTags}
        </div>
    `;
  }

  static getOtherUsersFromChat(users) {
    if (users.length === 1) return users;
    return users.filter(user => user._id != userLoggedIn._id);
  }

  // getUserChatImageElement
  static getUserImageTagForChat(user) {
    if (!user || !user.profilePic)
      return alert("The user argument passed into function is invalid");
    return `<img src='${user.profilePic}' alt='User's profile pic'>`;
  }

  static getChatNameFromDataOrUserNames(chatData) {

    if (chatData.chatName) return chatData.chatName;

    if (!chatData.chatName) {
      let otherChatUsers = this.getOtherUsersFromChat(chatData.usersInChat);
      return otherChatUsers
        .map(user => user.firstName + " " + user.lastName)
        .join(", ");
    }

  }

  static latestMessageAsPreview(latestMessage) {

    if (latestMessage != null) {
      let user = latestMessage.sender;
      return `
        ${user.firstName} ${user.lastName}: 
        ${latestMessage.content}
      `;
    }

    return "New chat";
  }

}
export default ChatListModel;