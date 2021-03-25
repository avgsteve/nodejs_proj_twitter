# ChatListController

1. Use class static method .async_build_instance to create instance and get any instance previously created.

2. ChatListView.showPreloaderInElement shows preloader so won't be blank page with nothing

3. Use ChatListModel.loadChatList() to load list data to create controller class instance

# ChatListController Main Function:
Event Handlers:
  - event_loadChatList
  - event_searchUserForNewChat
  - event_createNewChat