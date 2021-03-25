# ChatRoomController

### Used in chat room page:
#### (ex: http://128.199.143.55:3003/messages/chatRoom/60502fb1d3dd3f1dfa72e6a8)

1. Create instance when entering chat room page. Every instance will have chatId as 
instance property

2. ChatListView.showPreloaderInElement shows preloader so won't be blank page with nothing

3. Use ChatListModel.loadChatList() to load list data to create controller class instance

# ChatRoomController Main Function:
Event Handlers:
		- renderChatRoomPage   
        1. Emit socket data to join "chat room" in backend socket.IO
        2. Render all message data
        3. Update UI
        4. Mark all messages as read
		- updateChatRoomTitle
		- typingInTextarea (emit socket data to show typing status in chat room)
		- sendMessageWithClick