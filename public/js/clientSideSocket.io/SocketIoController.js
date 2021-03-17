import { socketEventNames } from './../../../server/socket.io/eventNames.js';

let currentProtocol = window.location.protocol;
let currentHost = window.location.host;

let chatId = window.location.pathname.split('/')[3];

class SocketIoController {

	static _createdInstance = null;
	static _createdInstanceCounter = 0; // for debugging to check if singleton pattern works

	constructor(option) {

		if (option.singletonPattern !== true)
			throw new Error(
				'Please use static method: build_singleton_instance() to create instance'
			);

		if (!io)
			throw new Error(
				`Please include/use socket.io CDN script to make sure global variable 'io' is assigned with socket.io object`
			);

		this._socketIsConnected = false;
		// this._socket = io("http://localhost:3003");
		console.log('option.serverAddress for socket.io: ', option.serverAddress);
		this._socket = io(option.serverAddress);

		this.establishSocketConnectionWithServer();

		// console.log('socket.io instance created!');
	}

	static build_singleton_instance() {

		// console.log('SocketIoController.build_singleton_instance is called!');

		// return created instance if there's any
		if (this._createdInstance !== null) return this._createdInstance;

		console.log('currentProtocol:', currentProtocol);

		// need hostName to connect to server-side socket.io

		console.log('current host for socket.io:', currentHost);

		let instance = new SocketIoController(
			{
				singletonPattern: true,				
				serverAddress: `${currentHost}`
			}
		);

		// assign instance to Class private field for using singleton pattern
		this._createdInstance = instance;
		this._createdInstanceCounter++; // for debugging. Make sure singleton pattern is working
		// console.log('current created instance: ', this._createdInstanceCounter);
		return this._createdInstance;
	}

	static getCreatedInstance() {

		// console.log('SocketIoController.getCreatedInstance is called!');

		if (!this._createdInstance)
			this.build_singleton_instance();

		// console.log('current created instance: ', this._createdInstanceCounter);

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