const User = require('../../../database/schemas/UserSchema');
const Post = require('../../../database/schemas/PostSchema');
const Notification = require('../../../database/schemas/NotificationSchema');
const HelperFunction = require('./controllerHelperFunctions');
const CustomError = require('./../../errorHandlers/customError');
const mongoose = require('mongoose');
const populateUserOption = "_id userName firstName lastName profilePic";


exports.getAllPosts = async (req, res, next) => {   

	let queryOptions = HelperFunction.searchOptionsFilter(req, res);

	// console.log('queryOptions for all posts: ', queryOptions);

	let results = await HelperFunction.findPostsWithFilterOptions(queryOptions);
	// console.log('results with queryOptions: ', results);

	res.status(200).send(results);
};


function postIdIsValid(postId) {
	if (postId.length === 0 || typeof postId !== 'string') throw Error('postId is incorrect');
	if (mongoose.Types.ObjectId.isValid(postId)) return true;
	return false;
}

function sendResponseForInvalidPostId(res) {
	return res.send({
		postData: null
	});
}

async function populateSearchResult(searchResult) {
	let populatedResult;
	populatedResult = await User.populate(searchResult, { path: 'postedBy', select: populateUserOption });
	populatedResult = await Post.populate(searchResult, { path: 'isRetweetToPost' });
	populatedResult = await Post.populate(searchResult, { path: 'isReplyToPost' });
	return populatedResult;
}

exports.getPostById = async (req, res, next) => {

	let postId = req.params.postId;

	if (!postIdIsValid(postId))
		return sendResponseForInvalidPostId(res);

	let searchResult = await Post.findById(postId);

	if (!searchResult || searchResult.isDeleted === true)
		return res.send({ postData: null });

	let populatedResult = await populateSearchResult(searchResult);

	let dataForClient = {};

	// If there's .isReplyToPost in searchResult, let dataForClient.isReplyToPost have fully populated document
	// so front-end page can have access to the populated document and render it in page
	if (populatedResult.isReplyToPost !== undefined) {
		populatedResult =
			await User.populate(populatedResult,
				{ path: 'isReplyToPost.postedBy', select: populateUserOption }
			);

		dataForClient.isReplyToPost = populatedResult.isReplyToPost;
		dataForClient.replies = [];
	}

	dataForClient = {
		postData: populatedResult // postData is property for front-end page functions
	};

	// 找出回覆 post 的其他 posts array, 並 assign 到 results.replies 這個屬性
	// find all other posts reply to the searchResult
	dataForClient.replies = await HelperFunction
		.findPostsWithFilterOptions(
			{ isReplyToPost: postId, isDeleted: { $ne: true } }
		);

	console.log('getPostById 送出的資料:', dataForClient);
	res.status(200).send(dataForClient);
};

// POST @host/api/posts/
// Create Post for reply or a plain post
exports.createPost = async (req, res, next) => {

	let postImageData = null;
	console.log('data for new post: ', req.body);

	console.log(`
  User: ${res.locals.user.userName} 
  Added ${req.body.isReplyToPost !== undefined ?
			'a reply' : 'a retweet'} post:  `, req.body);

	// 1) Check if the content is valid
	if (!req.body.post_content) {
		console.log("Content param not sent with request");
		return res.sendStatus(400);
	}

	// 2) Sanitize post_image data
	if (req.body.post_image) {
		postImageData = {};
		postImageData.url = req.body.post_image.url;
		postImageData.title = req.body.post_image.title;
	}

	console.log('postImageData: ', postImageData);


	let postCreatorId = res.locals.user._id;

	let dataForNewPost = {
		content: req.body.post_content,
		postedBy: postCreatorId,
		image: postImageData || null,
		pinned: false
	};


	// 2) Add extra property if is a "reply" post
	if (req.body.isReplyToPost) {
		dataForNewPost.isReplyToPost = req.body.isReplyToPost;
	}

	console.log('dataForNewPost:', dataForNewPost);

	// 3) Create & populate document
	Post.create(dataForNewPost)
		.then(
			async createdPost => {

				// 3-1) populate .postedBy field
				// (as isReplyToPost is a User document)
				createdPost =
					await User.populate(
						createdPost,
						{
							path: "postedBy",
							// ↓↓↓ optionally select fields to output 
							// as some fields can be huge and not used 
							select: "_id userName firstName lastName profilePic"
						}
					);

				// 3-2) populate .isReplyToPost field 
				// (as isReplyToPost is a Post document)
				createdPost =
					await Post.populate(
						createdPost,
						{
							path: "isReplyToPost",
							select: '_id postedBy '
						}
					);

				// 3-3) conditionally output the field ".postedBy" nested in .isReplyToPost field
				// and create notification document
				if (createdPost.isReplyToPost !== undefined) {

					// populate 'isReplyToPost.postedBy' field so it can be used to create notification document for other users
					createdPost = await User.populate(
						createdPost,
						// options for populating the document field ".isReplyToPost.postedBy"
						{
							path: "isReplyToPost.postedBy",
							select: 'userName _id'
						}
					);

					await Notification.insertNotification(

						createdPost.isReplyToPost.postedBy._id,  // 1) userTo 
						// use ._id as the post document has populate the path "isReplyToPost.postedBy"

						postCreatorId,			// 2) userFrom
						"reply",						// 3) notificationType
						createdPost._id		  // 4) entityId
					);
				}

				// 4) send result
				res.status(201).send(createdPost);
			})
		.catch(error => {
			console.log('error while creating post: \n', error);
			res.sendStatus(400);
		});
};

// PUT @host/api/posts/:postId/like
// Update likes fields
exports.likePost = async (req, res, next) => {

	// 1) Check params
	let postIdToLike = req.params.postId;
	let userIdSendsLike = res.locals.user._id;
	if (!userIdSendsLike)
		return console.warn(`Can't find the post id to perform like operation`);

	// 2) Check if this post has been liked (.findOne works, too. Not sure which is more efficient)
	let postHasBeenLikedByUser = await User.countDocuments({
		_id: userIdSendsLike,
		likes: postIdToLike
	});

	let hasBeenLiked = postHasBeenLikedByUser === 0 ? false : true;

	// 3) Determine option for updating document depending on if it was liked or not
	let option = hasBeenLiked ? "$pull" : "$addToSet";
	// https://docs.mongodb.com/manual/reference/operator/update/pull/index.html#remove-all-items-that-equal-a-specified-value


	// 4) Update res.locals.user so the front-end route will have latest likes data
	res.locals.user = await User
		.findByIdAndUpdate(
			userIdSendsLike,
			{
				[option]: { likes: postIdToLike }
			},
			{ new: true }
		)
		.catch(error => {
			console.log('error while insert/remove post id in user\'s likes data:', error);
			res.sendStatus(400);
		});

	// 5) Update the post been liked (or un-liked)
	let updatedPost = await Post.findByIdAndUpdate(
		postIdToLike,
		{
			[option]: { likes: userIdSendsLike }
		}, { new: true }
	)
		.catch(error => {
			console.log('error while insert a user liked data to a post:', error);
			res.sendStatus(400);
		});

	// 6) If there wasn't liked post create, it means represents a total new like. 
	// So in this case we can send notification
	if (!hasBeenLiked) {
		await Notification.insertNotification(
			updatedPost.postedBy,	 // to user id
			userIdSendsLike,			 // from user id
			"postLike",  					 // subject
			updatedPost._id 			 // entity id
		);
	}

	res.status(200).send(updatedPost);
};


// POST @host/api/posts/:postId/retweet
// Create a retweet post
// 2) Add or Remove a retweet post & update retweets field
exports.createRetweetPost = async (req, res, next) => {
	let originalPostId = req.params.postId;
	let currentUser = res.locals.user.userName;
	let retweetCreatorId = res.locals.user._id;

	// 1) Try to find and delete any existing retweet post
	let retweetToDelete = await Post
		.findOneAndDelete({
			postedBy: retweetCreatorId,
			isRetweetToPost: originalPostId
		}).catch(error => {
			console.log(error);
			res.sendStatus(400);
		});


	// 2) Determine update option by the result of retweetToDelete
	let updateOption = retweetToDelete === null ?
		"$addToSet" : "$pull";

	if (retweetToDelete === null) {
		console.log(`user: ${currentUser} is creating a retweet post`);
	} else {
		console.log(`user: ${currentUser} is removing a retweet post`);
	}

	let postToRetweet = retweetToDelete;

	// 3) Create and new retweet of there wasn't any retweet post created the current logged in user
	if (retweetToDelete === null) {
		postToRetweet = await Post
			.create({
				postedBy: retweetCreatorId,
				isRetweetToPost: originalPostId
			})
			.catch(error => {
				console.log(error);
				res.sendStatus(400);
			});
	}

	// 4) Insert post to user's retweets
	res.locals.user =
		await User.findByIdAndUpdate(
			retweetCreatorId,
			{
				// 在retweets中新增或是移除一筆 post，
				[updateOption]:
					{ retweets: postToRetweet._id }
			},
			{ new: true }
		)
			.catch(error => {
				console.log(error);
				res.sendStatus(400);
			});

	// 5) Insert user to post's retweetUsers
	let updatedOriginalPost =
		await Post
			.findByIdAndUpdate(
				originalPostId,
				{
					[updateOption]: { retweetUsers: retweetCreatorId }
				},
				{ new: true }
			)
			.catch(error => {
				console.log(error);
				res.sendStatus(400);
			});

	// 6) If there wasn't retweet post create, meaning it's going make a new retweet. So in this case we can send notification
	if (!retweetToDelete) {
		await Notification.insertNotification(
			// args: userTo, userFrom, notificationType, entityId
			updatedOriginalPost.postedBy, retweetCreatorId, "retweet", updatedOriginalPost._id);
	}


	res.status(200).send(updatedOriginalPost);
};


// DELETE @host/api/posts/:postId
// remove a post
exports.deletePost = async (req, res, next) => {
	// await Post.findByIdAndDelete(req.params.postId)
	// 	.then(() => res.sendStatus(204))
	// 	.catch(error => {
	// 		console.log(error);
	// 		res.sendStatus(400);
	// 	});

	try {

		const postToDelete = await Post.findOne(
			{
				_id: req.params.postId,
				postedBy: res.locals.user._id,
				isDeleted: { $ne: true }
			}
		);

		if (!postToDelete) res.status(400).send(
			new CustomError(`document is not available or not belonging to current request user or deleted`, 400)
		);

		console.log('found post to delete: ', postToDelete);

		postToDelete.contentBeforeDeleted = postToDelete.content;
		postToDelete.content = "(original post content was deleted by user)";
		postToDelete.isDeleted = true;

		const deletedPost = await postToDelete.save();
		if (deletedPost) return res.sendStatus(204);

	} catch (error) {
		let errorMsg = `Error while deleting post`;
		console.log(errorMsg, "\n", error);
		res.status(400).send(new CustomError(errorMsg, 400));
	}

};

// PUT @host/api/posts/:postId
// Update a post
exports.updatePost = async (req, res, next) => {

	if (req.body.pinned !== undefined) {

		await Post.updateMany(
			{ postedBy: res.locals.user },
			{ pinned: false }
		)
			.catch(error => {
				console.log(error);
				res.sendStatus(400);
			});

	}

	Post.findByIdAndUpdate(req.params.postId, req.body)
		.then(() => res.sendStatus(200))
		.catch(error => {
			console.log(error);
			res.sendStatus(400);
		});
};



