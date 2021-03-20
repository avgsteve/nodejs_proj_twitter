const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
    if (!res.locals.user) return res.redirect('/login');
    next();
});

router.get("/", (req, res, next) => {

    const userData = res.locals.user;

    res.status(200).render(
        "mePage/mePage",
        {
            pageTitle: "My Account",
            userLoggedIn: userData,
            userLoggedInJs: JSON.stringify(userData)
        }
    );
});

module.exports = router;