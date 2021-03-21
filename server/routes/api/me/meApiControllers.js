const User = require('../../../database/schemas/UserSchema');


const path = require("path");
const fs = require("fs"); ``;
const populateUserOption = "_id userName firstName lastName profilePic";


exports.getCurrentLoggedInUser = function (req, res) {
	console.log('getCurrentLoggedInUser is called');

	User.findById(res.locals.user._id).then(result => {
		res.send(result);
	});

};


