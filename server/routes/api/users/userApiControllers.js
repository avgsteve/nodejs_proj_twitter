const bcrypt = require('bcrypt');
const User = require('../../../database/schemas/UserSchema');
const UserActivation = require('../../../database/schemas/UserActivationSchema');
const UserAccDelete = require('../../../database/schemas/UserAccDeleteSchema');
const UserPasswordReset = require('../../../database/schemas/UserPwdResetSchema');

const CustomError = require('../../errorHandlers/customError');
const sendActivationMail = require('./sendActivationMail');
const sendPwdResetTokenMail = require('./sendPwdResetTokenMail')
const cookieHelper = require('./../auth/sendResWithToken');
const Notification = require('../../../database/schemas/NotificationSchema');
const { body } = require('express-validator');
const chalk = require('chalk');

const path = require("path");
const fs = require("fs");
const populateUserOption = "_id userName firstName lastName profilePic";


function sendUserExistedError(email, userName, userExisted, res) {
	let error = new CustomError("User already exits", 400);

	if (email === userExisted.email) {
		// 修改 error.errors[0] 的內容
		error.setErrorMessage("Email is already taken");
		error.setErrorLocation("register api");
		error.setErrorParam('email');
		error.setErrorValue(email);
	}

	if (userName === userExisted.userName) {
		error.setOneMoreError("User name is already taken", {
			errorLocation: "register api",
			errorParam: 'userName',
			errorValue: userName
		});
	}

	console.log('user註冊失敗: ', error);

	return res.status(400).json(error);
}

exports.registerFieldsToCheck =
	[
		body('firstName').notEmpty().trim().withMessage('first name is required'),
		body('lastName').notEmpty().trim().withMessage('last name is required'),
		body('userName').notEmpty().trim().withMessage('user name is required'),
		body('email').isEmail().withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({ min: 4, max: 20 })
			.withMessage('Password must be between 4 and 20 characters')
	];


exports.getUsersByQuery = async (req, res, next) => {
	let searchObj = req.query;

	if (req.query.searchTerm === undefined)
		res.status(400).send(new CustomError(`Must call this api with "searchTerm" param and value to search for user`, 400))

	console.log('GET@/api/users 的 req.query:', req.query);
	if (req.query.searchTerm !== undefined) {
		searchObj = {
			$or: [
				{ firstName: { $regex: req.query.searchTerm, $options: "i" } },
				{ lastName: { $regex: req.query.searchTerm, $options: "i" } },
				{ userName: { $regex: req.query.searchTerm, $options: "i" } },
				// $options: "i"  => case insensitive
				// https://tinyurl.com/mongodbRegexOption
			]
		};
	}

	User.find(searchObj)
		.then(results => res.status(200).send(results))
		.catch(error => {
			console.log(error);
			res.sendStatus(400);
		});
};

exports.register = async (req, res) => {

	// console.log('req.body for sign up: ', req.body);
	let {
		firstName, lastName,
		userName, email,
		password
	} = req.body;
	// let payload = req.body;

	if (firstName && lastName && userName && email && password) {

		try {

			let userExisted = await User.findOne({
				$or: [
					{ userName: userName },
					{ email: email }
				]
			});

			if (!userExisted) {

				// console.log('帳號尚未註冊，開始新增使用者 registering new account');
				req.body.password = await bcrypt.hash(password, 10);

				User.create(req.body)
					.then(
						async (newUser) => {

							// Add activation doc _id to user's doc
							let activationDoc = await UserActivation.createNewDoc(
								newUser._id, newUser.userName, newUser.email);
							newUser.activation = activationDoc._id;
							await newUser.save();

							// Don't expose password to front-end even it's hashed
							newUser.password = '---encrypted---';

							// Add .activationCode property to user doc for send mail later
							newUser.activationCode = activationDoc.activationCode;

							sendActivationMail(newUser, req).then(() => {
								res.status(201).json(newUser);
							});
						});

			} else {
				// User found
				sendUserExistedError(email, userName, userExisted, res);
			}

		} catch (e) {
			console.log('error while registering new user: ', e);
			return res.status(400).json("error while registering new user");
		}
	}
};

function sendUserActivationError(res, errorMessage = 'error') {
	return res
		.status(400)
		.send(new CustomError(
			`${errorMessage}`, 400)
		);
}
// post @root/activateUser
exports.activateUser = async (req, res) => {

	console.log('activateUser req.body: ', req.body);

	let { userName, activationCode } = req.body;
	// let payload = req.body;

	if (userName && activationCode) {

		console.log(`start activation for user name: ${userName}`);

		try {

			let activationDoc = await UserActivation.findOne(
				{
					$or: [
						{ userName: userName },
						{ email: userName }
					]
				});

			console.log('activationDoc: ', activationDoc);

			if (!activationDoc)
				return sendUserActivationError(
					res, `Can't find user activation data. Please register`);

			if (activationDoc.isExpired())
				return sendUserActivationError(
					res, `Activation code has expired. Please request a new one`);

			if (activationDoc.activationCode !== activationCode)
				return sendUserActivationError(
					res, `Activation code is incorrect`);

			// All clear:  Make activation and user document 'activated'
			await activationDoc.makeActivate();
			let activatedUser = await User.findOneAndUpdate(
				{ userName: userName },
				{ isActivated: true },
				{ new: true }).select('-password');

			if (!activatedUser) return sendUserActivationError(
				res, `No user data found. Please register`);

			return res.send(activatedUser);

		} catch (caughtError) {
			let error = new CustomError(`Can't activate user`, 400);
			console.log('error: ', error, caughtError);
			return res
				.status(400)
				.send(error);
		};

	}

	// Defensive programming: 
	// In case the required fields are empty and not checked by previous middleware
	// and either userName or activationCode is not provided
	return sendUserActivationError(
		res, `user name or activation code is missing: ${JSON.stringify(req.body)}`);
};

function send400ResWithError(errMsg, res) {
	if (!errMsg || !res) throw Error('need errMsg and res');
	let error = new CustomError(errMsg, 400);
	res.status(400).send(error);
}

function checkPasswordBeforeUpdate({ currentPassword, newPassword, confirmPassword, res }) {

	if (!newPassword || !confirmPassword) {
		throw Error(`Need to provide newPassword and confirmPassword:`);
	}

	if (newPassword !== confirmPassword) {
		return send400ResWithError(
			`new password and confirm password don't match`, res);
		return false;
	}

	if (newPassword === currentPassword) {
		send400ResWithError(
			`new password can't be the same as current password`, res);
		return false;
	}
	return true;
}

exports.changePassword = async (req, res) => {
	const { currentPassword, newPassword, confirmPassword } = req.body;

	let checkResult =
		checkPasswordBeforeUpdate({ currentPassword, newPassword, confirmPassword, res });
	if (!checkResult) return;

	let userDoc = await User.findOne({ _id: res.locals.user._id });


	if (!userDoc)
		return send400ResWithError(`User document is not found`, res);

	// Current password must be correct
	if (!(await userDoc.verifyPassword(currentPassword)))
		return send400ResWithError(
			`Password is incorrect`, res
		);

	let updatedUserDoc = await userDoc.updatePassword(newPassword);

	res.send(200);

};

function checkPasswordBeforeUpdate({ currentPassword, newPassword, confirmPassword, res }) {

	if (!newPassword || !confirmPassword) {
		throw Error(`Need to provide newPassword and confirmPassword:`);
	}

	if (newPassword !== confirmPassword) {
		return send400ResWithError(
			`new password and confirm password don't match`, res);
		return false;
	}

	if (newPassword === currentPassword) {
		send400ResWithError(
			`new password can't be the same as current password`, res);
		return false;
	}
	return true;
}

// POST@root/requestPasswordResetToken   
// Used by authRoutes.js
// Function: To request a token to reset password
exports.requestPasswordResetToken = async (req, res) => {
	const { email } = req.body;

	// TODO: Let super-admin to send reset request user's account
	try {

		let userDoc = await User.findOne({ email }).select('_id email firstName');


		if (!userDoc)
			return send400ResWithError(`User document is not found`, res); // borrow function : send400ResWithError

		// Checking if any previous reset document was created
		let resetDoc = await UserPasswordReset.findOne({
			userId: userDoc._id
		});

		// Creating a new reset document
		if (!resetDoc) {

			resetDoc = await UserPasswordReset.create({
				userId: userDoc._id,
				email: userDoc.email,
				firstName: userDoc.firstName
			});
			resetDoc = await resetDoc.setNewResetToken();
			console.log('new password reset request created: ', resetDoc);
			await sendPwdResetTokenMail(resetDoc, req);
			return res.send('OK');
		}

		console.log('resetDoc.canBeResent: ', resetDoc.canBeResent());

		// If there is a reset doc created before, check if it's OK to resend
		if (resetDoc && !resetDoc.canBeResent()) {
			let minutes = Math.floor(resetDoc.timeRemainToResend() / 1000 / 60);
			let seconds = Math.floor(resetDoc.timeRemainToResend() / 1000 - minutes * 60);
			let timeToResend = `Time to resend: ${minutes} minutes ${seconds} seconds`;
			return send400ResWithError(timeToResend, res);
		}

		if (resetDoc && resetDoc.canBeResent()) {
			resetDoc = await resetDoc.setNewResetToken();
			await sendPwdResetTokenMail(resetDoc, req);
		}

		res.send('OK');

	} catch (error) {
		console.log('error in request password function:', error);
	}
	// res.send(resetDoc); // Don't expose token to front-end

}

// Set new password with RESET TOKEN @path: /setPasswordWithToken
exports.setPasswordWithToken = async (req, res) => {

	let { token, newPassword, confirmPassword, captcha } = req.body;

	// Checking if any previous reset document was created
	let resetDoc = await UserPasswordReset.findOne({
		resetToken: token
	});

	// Creating a new reset document
	if (!resetDoc) return send400ResWithError(`Reset document is not found`, res); // borrow function : send400ResWithError

	console.log('resetDoc.isExpired: ', resetDoc.isExpired());

	if (resetDoc.isExpired()) return send400ResWithError(`Token has expired. Please request a new one`, res); // borrow function : send400ResWithError

	let userDoc = await User.findOne({
		_id: resetDoc.userId
	});

	console.log('userDoc after change password: ', userDoc);

	let updatedUser = await userDoc.updatePassword(newPassword);
	updatedUser.hashed_password = "---encrypted---";
	res.send(updatedUser);


}

// post @root/activateUser
exports.resendActivation = async (req, res) => {

	console.log('req.body for resend activationCode: ', req.body);
	let { userName } = req.body;

	if (userName) {
		try {
			let userDoc = await User.findOne({
				userName: userName,
			}).select('_id userName firstName email isActivated');

			console.log('userDoc for resend: ', userDoc);

			// Don't resend if user account is not registered
			if (!userDoc)
				return res.status(400).send(new CustomError(`No user data found. Please register`, 400));

			// Don't resend if user account is not activated
			if (userDoc.isActivated === true)
				return res.status(400).send(new CustomError(`User is already activated`, 400));

			// update user document after activationDoc is done
			let activation = await UserActivation.findOne({ userName: userName });

			// If no activation doc in DB , create a new one and send activation mail
			if (!activation) {
				activation = await UserActivation.createNewDoc(userDoc._id, userName);
				userDoc.activationCode = activation.activationCode;
				return sendActivationMail(userDoc, req).then(result => {
					return res.status(200).json(userDoc);
				});
			}
			
			// If there's activation doc found in DB, don't resend if user account is activated
			if (activation.isActivated === true) {
				return res
					.status(400)
					.send(new CustomError(`Activation document is already activated`, 400));
			}

			// Don't resend if last activation mail was sent less than 5 minutes ago
			if (activation.timeRemainToResend() > 0) {

				let minutes = Math.floor(activation.timeRemainToResend() / 1000 / 60);
				let seconds = Math.floor(activation.timeRemainToResend() / 1000 - minutes * 60);
				let timeToResend = `Time to resend: ${minutes} minutes ${seconds} seconds`;
				return res
					.status(400)
					.send(
						new CustomError(
							`Can't request new activation code within 5 minutes. ${timeToResend}`
							, 400)
					);
			}

			// When all clear, generate new activation code and send email
			let updatedActivation = await activation.generateActivationCode();
			userDoc.activationCode = updatedActivation.activationCode;
			return await sendActivationMail(userDoc, req).then(result => {
				res.status(200).json(userDoc);
			});


		} catch (caughtError) {
			let error = new CustomError(`Can't resend activation`, 400);
			console.log('error: ', error, caughtError);
			return res
				.status(400)
				.send(error);
		};

	};

	// if either of userName && activationCode is not provided
	return res
		.status(400)
		.send(new CustomError(`user name is missing: ${JSON.stringify(req.body)}`, 400));
};

// Url path: router.put("/api/users/:userIdToFollow/follow)
exports.followUser = async (req, res, next) => {

	let userIdToFollow = req.params.userIdToFollow;
	let targetUser = await User.findById(userIdToFollow);

	console.log('Prepare to follow user. User Id: ', userIdToFollow);

	if (targetUser === null) return res.sendStatus(404);


	let hasFollowedTargetUser =
		targetUser.followers &&
		targetUser.followers.includes(res.locals.user._id);

	let updateOption = hasFollowedTargetUser ? "$pull" : "$addToSet";

	console.log(
		`The user ${chalk.yellow(res.locals.user.userName)} is going to ${hasFollowedTargetUser === true ? 'un-follow ' : 'follow'} the user ${chalk.yellow(targetUser.userName)}`
	);

	// 1) 將目前登入使用者的 following 資料加入被follow的使用者id
	res.locals.user = await User.findByIdAndUpdate(
		res.locals.user._id,
		{
			[updateOption]: { following: userIdToFollow }
		},
		{ new: true }
	)
		.catch(error => {
			console.log('error while updating follower: ', error);
			res.sendStatus(400);
		});

	// 2) 更新被追蹤的使用者的 followers 屬性
	User.findByIdAndUpdate(
		userIdToFollow,
		{
			[updateOption]: { followers: res.locals.user._id }
		}
	)
		.catch(error => {
			console.log(error);
			res.sendStatus(400);
		});

	if (!hasFollowedTargetUser) {
		// only send notification when current user is going to follow the target user
		await Notification.insertNotification(
			userIdToFollow, res.locals.user._id, "follow", res.locals.user._id
		);
	}

	res.status(200).send(res.locals.user);
};

exports.deleteUser = async (req, res, next) => {

	console.log('req.body: ', req.body);

	if (!req.body.password)
		throw Error('Need password to perform delete action');

	let currentUserDoc = await User.findOne({
		_id: res.locals.user._id
	}).select('password role _id userName');

	// Check request user's id in case some malicious users use this api to delete other user's account
	if (res.locals.user._id.toString() !== req.params.userIdToDelete) {
		console.log(
			chalk.red(
				`[Current user: ${res.locals.user._id} (${res.locals.user.userName}) is trying to delete other user's id: ${req.params.userIdToDelete}]`
			)
		);

		return res.status(400).send(new CustomError(
			'User can only his/her own account. Current logged-in user is not the user for this request'
		));
	}
	// Check user role
	if (currentUserDoc.role !== 'user')
		return res.status(400).send(new CustomError(
			'Only normal user can delete his/her own account'
		));

	// Check password
	let pwdVerified = await bcrypt.compare(
		req.body.password, currentUserDoc.password);
	if (!pwdVerified)
		return res.status(400).send(new CustomError('Password is incorrect'));

	// Update delete document
	let deleteDoc = await UserAccDelete.createNewDoc(
		currentUserDoc._id,
		currentUserDoc.userName // name field is just for record
	);

	// Use updated delete document to update user document
	currentUserDoc.toBeDeleted = true;
	currentUserDoc.toBeDeletedAt = deleteDoc.timeToDelete;
	await currentUserDoc.save();

	res.send(deleteDoc);

};

exports.cancelDeleteUser = async (req, res, next) => {

	if (!req.body.password)
		throw Error('Need password to perform action to cancel delete ');

	let currentUserDoc = await User.findOne({
		_id: res.locals.user._id
	}).select('password role _id userName');

	// Check request user's id in case some malicious users use this api to delete other user's account
	if (res.locals.user._id.toString() !== req.params.userIdToDelete) {
		console.log(
			chalk.red(
				`[Current user: ${res.locals.user._id} (${res.locals.user.userName}) is trying to cancel delete other user's id: ${req.params.userIdToDelete}]`
			)
		);

		return res.status(400).send(new CustomError(
			'User can only cancel delete his/her own account. Current logged-in user is not the user for this request'
		));
	}
	// Check user role
	if (currentUserDoc.role !== 'user')
		return res.status(400).send(new CustomError(
			'Only normal user can cancel delete'
		));

	// Check password
	let pwdVerified = await bcrypt.compare(
		req.body.password, currentUserDoc.password);
	if (!pwdVerified)
		return res.status(400).send(new CustomError('Password is incorrect'));

	let deleteDoc = await UserAccDelete.findOne({
		userIdToDelete: res.locals.user._id
	});

	deleteDoc.set({ isCanceled: true });
	await deleteDoc.save();

	// Use updated delete document to update user document
	currentUserDoc.toBeDeleted = false;
	currentUserDoc.toBeDeletedAt = "";
	await currentUserDoc.save();

	res.send(deleteDoc);

}

exports.getFollowingUsers = async (req, res, next) => {

	User.findById(req.params.userId)
		.populate("following")
		.then(results => {
			res.status(200).send(results);
		})
		.catch(error => {
			console.log(error);
			res.sendStatus(400);
		});
};

exports.getFollowersUsers = async (req, res, next) => {
	User.findById(req.params.userId)
		.populate("followers")
		.then(results => {
			res.status(200).send(results);
		})
		.catch(error => {
			console.log(error);
			res.sendStatus(400);
		});
};

exports.uploadProfilePhoto = async (req, res, next) => {

	if (!req.file) {
		console.log("No file uploaded with ajax request.");
		return res.sendStatus(400);
	}

	let dirName = path.join(__dirname, "");
	// 'D:\\git\\NodeJs\\nodejs_twitter\\server\\routes\\api\\users'
	let dirName2 = path.join(__dirname, "./../../../../");
	// 'D:\\git\\NodeJs\\nodejs_twitter\\'

	let pathOfSavedFile = req.file.path;
	// 'public\\images\\user\\63b9169810354104db47b14b0370cdaa', (沒有副檔名的本地路徑)

	let filePathForProfileLink = path.join(
		__dirname, `${req.file.path}.png`
	);
	//  filePathForProfileLink: 'D:\\git\\NodeJs\\nodejs_twitter\\server\\routes\\api\\users\\public\\images\\user\\63b9169810354104db47b14b0370cdaa.png' (路徑不正確，不適合作為資料庫用的相對路徑)

	let localFilePath = path.join(
		__dirname,
		// `./../../../../public/images/user/${req.file.filename}`
		`./../../../../public/images/user/${req.file.filename}`
	);
	// 'D:\\git\\NodeJs\\nodejs_twitter\\public\\images\\user\\6df210d16495db94ef6fcc1ed1a6fdfd',
	// (路徑正確,不適合作為資料庫用的相對路徑，但是是存在 local 資料夾的正確路徑，只是沒有副檔名)

	let newLocalFilePathWithExt = path.join(
		__dirname,
		// `./../../../../public/images/user/${req.file.filename}`
		`./../../../../public/images/user/${res.locals.user.userName}-profileImage.png`
	);
	console.log('檔案路徑', {
		dirName, dirName2, pathOfSavedFile, filePathForProfileLink,
		localFilePath, newLocalFilePathWithExt,
	});

	// 將沒有副檔名的檔案名稱 變更為 有副檔名的檔案名稱
	fs.rename(localFilePath, newLocalFilePathWithExt, async error => {
		if (error != null) {
			console.log(error);
			return res.sendStatus(400);
		}

		res.locals.user = await User.findByIdAndUpdate(
			res.locals.user._id, {
			// 更新使用者資料的 profilePic 欄位
			// PS: static folder 是設在 root / public，前端讀取資料是直接讀取 /public 底下的資料夾 ，也就是 root/images/user/xxx.png
			profilePic: `/images/user/${res.locals.user.userName}-profileImage.png`
		},
			{ new: true });
		res.sendStatus(204);
	});

};

exports.uploadCoverPhoto = async (req, res, next) => {
	if (!req.file) {
		console.log("No file uploaded with ajax request.");
		return res.sendStatus(400);
	}

	// let filePath = `/uploads/images/${req.file.filename}.png`;

	let localFilePath = path.join(
		__dirname,
		// `./../../../../public/images/user/${req.file.filename}`
		`./../../../../public/images/user/${req.file.filename}`
	);
	// 'D:\\git\\NodeJs\\nodejs_twitter\\public\\images\\user\\6df210d16495db94ef6fcc1ed1a6fdfd',
	// (路徑正確,不適合作為資料庫用的相對路徑，但是是存在 local 資料夾的正確路徑，只是沒有副檔名)

	let newLocalFilePathWithExt = path.join(
		__dirname,
		// `./../../../../public/images/user/${req.file.filename}`
		`./../../../../public/images/user/${res.locals.user.userName}-coverImage.png`
	);

	fs.rename(localFilePath, newLocalFilePathWithExt, async error => {
		if (error != null) {
			console.log(error);
			return res.sendStatus(400);
		}

		res.locals.user = await User.findByIdAndUpdate(
			res.locals.user._id, {
			// 更新使用者資料的 profilePic 欄位
			// PS: static folder 是設在 root / public，前端讀取資料是直接讀取 /public 底下的資料夾 ，也就是 root/images/user/xxx.png
			coverPhoto: `/images/user/${res.locals.user.userName}-coverImage.png`
		},
			{ new: true });
		res.sendStatus(204);
	});

};