import ChatRoomView from './ChatRoomView';

// Create new Class instance in ChatRoomController constructor function
let chatRoomView;

import ChatRoomModel from './ChatRoomModel';
// Create new Class instance in ChatRoomController constructor function
let chatRoomModel;

import ChatRoomSocketEvent from './ChatRoomSocketEvent';
let socketEventHandlers;

import ProfileView from './../profile/profilePageView';
import GlobalView from './../GlobalControl/GlobalView';

import SocketIoController from './../clientSideSocket.io/SocketIoController';

import { socketEventNames as socketEvent } from './../../../server/socket.io/eventNames';

// there's already a socket.io instance in index.js
// so get the created one in case of bug by creating multiple socket instance
let socket = SocketIoController.getCreatedInstance();

class ChatRoomController {

	constructor() {

		// Check if current page is for chat room
		let chatIdFromUrl = window.location.pathname.split('/')[3];
		if (!chatIdFromUrl)
			throw Error(`ChatId is not found in url path. Please check the url is correct`);
		
		this._chatId = chatIdFromUrl;

		// event listeners & handlers
		this.updateChatRoomTitleEvent();
		this.renderChatRoomPage();
		this.typingInTextareaEvent();
		this.sendMessageWithClickEvent();

		// Create instance of other two Classes after this constructor is called to make sure chatRoom controller's function doesn't interfere with other controller
		chatRoomView = new ChatRoomView();
		chatRoomModel = new ChatRoomModel()
		socketEventHandlers = new ChatRoomSocketEvent();
	}

	get chatId() {
		return this._chatId;
	}

	renderChatRoomPage() {
		// equals to $(document).ready(...)
		$(async () => {

			if (!this.chatId)
				return console.warn(`can't find chatId for updateChatRoomTitleEvent`);

			let $messageArea = $(".MessageArea");

			// socket.emit("join room", this.chatId); // 1) 加入後端的socket emit room

			socket.emit(socketEvent.startChatById, this.chatId);

			await chatRoomView.refreshChatTitle();

			// 2) 從資料庫取得多筆對話訊息，轉成html
			let messagesData = await chatRoomModel.getChatMessagesFromDB();

			// console.log('messagesData', messagesData);

			let messageHtml = chatRoomModel.convertMessageDataToJoinHTML(messagesData);

			// 3) 將訊息html置入$messageArea
			chatRoomView.addMessagesHtmlToPage(messageHtml, $messageArea);
			chatRoomView.scrollToBottom({ smoothScroll: false }); // 若為true的話就會用捲動的方式

			// 4) update UI
			$(".chatMessagePreloader").remove();
			$(".messagesContainer").css("visibility", "visible");

			// 5) send request to mark all message as read (because fetched and read all messages)
			if (await chatRoomModel.markAllMessagesAsRead()) {
				let unreadMessageCounts = await chatRoomModel.getUnreadChatData();
				GlobalView.refreshMessagesBadge(unreadMessageCounts);
			}
		});
	}

	updateChatRoomTitleEvent() {

		if (!this.chatId)
			return console.warn('can\'t find chatId for updateChatRoomTitleEvent');

		$("#chatNameChangeButton").on('click', async () => {
			
			ProfileView.showPreloaderInFollowButton($('#chatNameChangeButton'));
			let successful = await chatRoomModel.updateChatNameViaAPI();

			if (successful) {

				chatRoomView.refreshChatTitle();

				$('#changeChatNameModal').modal('hide');

				// use alert from GlobalView Class to reuse code created before
				GlobalView.showAlert(
					{
						styleOption: 1, // style for success message
						message: "update successful!",
						slideIn: true,
						timeToDisappear: 2000,
						// closeManually: true,
						// elementToShowAlert: $('.mainSectionContainer'),
					}
				);
			}
		});
	}

	sendMessageWithClickEvent() {
		$(".sendMessageButton").on('click', () => {
			socket.emit("stop typing", this.chatId); //send stop typing right after
			this.sendMessageAction();
			});
	}

	typingInTextareaEvent() {

		$("textarea.messageInput").on('keydown', (event) => {
			chatRoomModel.updateTypingStatus();
			if (event.which === 13) {
				socket.emit("stop typing", this.chatId);
				this.sendMessageAction();
				return false;
			}
		});
	}


	// 如果執行這個function只會傳回一個 async function
	// 要執行的話還要再加上 () 來呼叫
	async sendMessageAction() {

		if (!this.chatId)
			return console.warn(
				`找不到chatId，停止執行 sendMessageAction`);

		// 1) get input message

		let newMessage = $(".messageInput").val().trim();
		if (newMessage === "")
			return console.log(`can't create a empty message`);

		// 2) 清空輸入區塊 clear input textarea
		chatRoomView.clearMessageInputArea();

		// 3) Use input to create new message in page (messageDiv) and in database
		let localMessage = chatRoomModel.createLocalMessage(newMessage);

		// Use localMessage To add new div to page instead of waiting for the message created in database. Will be no delay after sending message so will provide better experience
		let messageDiv =
			chatRoomModel.createMessageHtml(localMessage, null, userLoggedIn._id);
		chatRoomView.addMessagesHtmlToPage(messageDiv);
		chatRoomView.scrollToBottom();


		let messageCreatedInDB =
			await chatRoomModel.sendNewMessageToApi(newMessage);
		
		// 4) send socket event & update UI
		if (messageCreatedInDB) {
			socket.emit(
				socketEvent.newChatMessageFromClient, messageCreatedInDB
			);
		};

		// TODO: 之後有時間再想一下，送出訊息失敗的話後續該如何處理
	}

}


export default ChatRoomController;