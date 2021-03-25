const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
    if (!res.locals.user) return res.redirect('/login');
    next();
});


router.get("/", (req, res, next) => {

    const userData = res.locals.user;
    let payload = {
        pageTitle: "View post",
        userLoggedIn: userData,
        userLoggedInJs: JSON.stringify(userData),
    };

    res.status(200).render("photoPage/photoPage", payload);
});

module.exports = router;