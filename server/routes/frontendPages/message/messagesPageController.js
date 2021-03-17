const mongoose = require('mongoose');
const findChatWithOneUserById = require('./findChatWithOneUserById').default;
const User = require('../../../database/schemas/UserSchema');
const Chat = require('../../../database/schemas/ChatSchema');


exports.redirectToListPage = (req, res, next) => {
	res.redirect('/messages/list');
};

exports.chatRoomListPage = (req, res, next) => {
	const userData = res.locals.user;

	res.status(200).render(
		"messagesPage/chatList/chatListPage",
		{
			pageTitle: "Chat List Page",
			userLoggedIn: userData,
			userLoggedInJs: JSON.stringify(userData)
		}
	);
};

exports.createChatPage = (req, res, next) => {
	const userData = res.locals.user;
	res.status(200).render(
		"messagesPage/chatList/createNewChat",
		{
			pageTitle: "Create New Chat/Messages with others",
			userLoggedIn: userData,
			userLoggedInJs: JSON.stringify(userData)
		}
	);
};

exports.chatRoomPage = async (req, res, next) => {

	let userData = res.locals.user;
	let userId = userData._id;
	let chatId = req.params.chatId;
	let chatIdIsValid = mongoose.isValidObjectId(chatId);

	console.log(
		`User "${res.locals.user.userName}" enter /messagesPage/:chatId(${chatId})`
	);

	let payload = {
		pageTitle: "Chat",
		userLoggedIn: userData,
		userLoggedInJs: JSON.stringify(userData)
	};

	// 檢查路徑的id格式是否正確
	if (!chatIdIsValid) {
		console.log('Error: chat id is invalid: ', chatId);
		payload.errorMessage =
			"Chat does not exist or you do not have permission to view it.";
		return res.status(200).render("messagesPage/chatRoom/chatRoomPage", payload);
	}

	// 透過 id 尋找 Chat 文件，
	let chat =
		await Chat.findOne(
			{
				_id: chatId,
				usersInChat:
				{
					$elemMatch: { $eq: userId }
				}
			}
		)
			.populate("usersInChat");


	if (chat === null) {

		console.log('Error:  (第一次查詢) result of chat document is null: ', chatId);

		// 如果沒有團體對話的文件存在的話，
		// 就透過user id去找與其他使用者一對一的對話文件

		let otherUser = await User.findById(chatId);
		if (otherUser !== null) {
			chat = await findChatWithOneUserById(userId, otherUser._id);
		}
	}

	// 如果第二次還是找不就代表沒有相關文件存在，直接傳回錯誤訊息
	if (chat === null) {

		console.log('Error: (第二次查詢) result of chat document is null: ', chatId);
		payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
	}
	else {
		payload.chat = chat;
	}

	// console.log('查詢到的 chat data & payload', payload);

	res.status(200).render("messagesPage/chatRoom/chatRoomPage", payload);
};

