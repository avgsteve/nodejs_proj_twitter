const bcrypt = require('bcrypt');
const User = require('../../../database/schemas/UserSchema');
const UserActivation = require('../../../database/schemas/UserActivationSchema');
const CustomError = require('../../errorHandlers/customError');
const sendActivationMail = require('./sendActivationMail');
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
							let activationDoc = await UserActivation.createNewDoc(newUser._id, newUser.userName);
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
					userName: userName,
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