import { socketEventNames } from './../../../server/socket.io/eventNames.js';

let currentProtocol = window.location.protocol;
let currentHost = window.location.host;

let chatId = window.location.pathname.split('/')[3];

class SocketIoController {

	static _createdInstance = null;
	static _createdInstanceCounter = 0; // for debugging to check if singleton pattern works

	constructor(option) {

		// As we can use socket.io instance as global and unique data media, so no need to create different instances across application. Also to reduce change of having bugs
		if (option.singletonPattern !== true)
			throw new Error(
				'Please use static method: build_singleton_instance() to create singleton instance'
			);

		if (!io)
			throw new Error(
				`Please include/use socket.io CDN script to make sure global variable 'io' is assigned with socket.io object`
			);

		this._socketIsConnected = false;

		// this._socket = io("http://localhost:3003"); // <-- original code
		// console.log('option.serverAddress for socket.io: ', option.serverAddress); // <-- localhost:3003

		this._socket = io(option.serverAddress);

		this.establishSocketConnectionWithServer();

		// console.log('socket.io instance created!');
	}

	static build_singleton_instance() {

		// return created instance so there won't reduplicated and difference socket.io instance
		if (this._createdInstance !== null) return this._createdInstance;

		let instance = new SocketIoController(
			{
				singletonPattern: true,				
				serverAddress: `${currentHost}` // host address might change when hosting on different cloud host
			}
		);

		// assign instance to Class private field for using singleton pattern
		this._createdInstance = instance;
		this._createdInstanceCounter++; // for debugging. Make sure singleton pattern is working
		// console.log('current created instance: ', this._createdInstanceCounter);
		return this._createdInstance;
	}

	static getCreatedInstance() {

		if (!this._createdInstance)
			this.build_singleton_instance();

		return this._createdInstance;
	}

	get isConnected() {
		return this._socketIsConnected;
	}

	establishSocketConnectionWithServer() {
		this._socket.emit(
			"setupWebSocketConnection", userLoggedIn
		);

		this._socket.on(
			"connectedToServerSuccessful",
			() => {
				console.log('%c socket connection to server established!', 'background: #222; color: #bada55');
				this._socketIsConnected = true;
			});

		this._socket.on(
			"message received",
			(newMessage) => {
				console.log('receive message from server socket! :', newMessage);
			});

	}

	// emit socket event and data to server-side socket.io
	emit(eventName, eventData) {
		this._socket.emit(eventName, eventData);
	}

	// build event handler for socket data from server-side socket.io
	on(eventName, eventCallbackForData) {
		this._socket.on(eventName, eventCallbackForData);
	}

	emitNoticeViaSocketToUser(recipientUserId) {
		console.log('emitNoticeViaSocketToUser to id:', recipientUserId);
		if (recipientUserId === userLoggedIn._id) return;
		this.emit(socketEventNames.newNotificationFromClient, recipientUserId);
	}

}


export default SocketIoController;