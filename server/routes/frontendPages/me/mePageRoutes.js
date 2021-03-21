const User = require('./../../../database/schemas/UserSchema')
const userApiController = require('./../../api/users/userApiControllers')
const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
    if (!res.locals.user) return res.redirect('/login');
    next();
});

router.get("/", (req, res, next) => {

    let keysNotToCopy = [
        'likes', 'retweets', 'following', 'followers', 'password', 'updatedAt'
    ];

    let updatedUserObj = {};
    for (let key in res.locals.user) {
        if (!keysNotToCopy.includes(key))
            updatedUserObj[key] = res.locals.user[key];
    }
    
    res.status(200).render(
        "mePage/mePage",
        {
            pageTitle: "My Account",
            userLoggedIn: updatedUserObj,
            userLoggedInJs: JSON.stringify(updatedUserObj)
        }
    );
});


module.exports = router;