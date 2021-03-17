const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const User = require('../../../database/schemas/UserSchema');


// root/search
router.use((req, res, next) => {
    if (!res.locals.user) return res.redirect('/login');
    next();
});

router.get("/", (req, res, next) => {
    let payload = createPayload(res.locals.user);
    payload.selectedTab = 'posts';

    res.status(200).render("searchPage/searchPage", payload);
});

router.get("/:selectedTab", (req, res, next) => {
    let payload = createPayload(res.locals.user);
    payload.selectedTab = req.params.selectedTab;
    res.status(200).render("searchPage/searchPage", payload);
});

function createPayload(userLoggedIn) {
    return {
        pageTitle: "Search",
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn)

    };
}

module.exports = router;